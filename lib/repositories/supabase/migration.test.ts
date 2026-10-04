import { readFileSync, readdirSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { defaultDataset } from '../fixtures/data';

/*
 * The migrations and seed, executed in Postgres (PGlite, in-process WASM) with the few
 * Supabase pieces they rely on stubbed: the anon/authenticated roles, auth.users + auth.uid(),
 * and the storage tables. Proves the SQL runs, the seed fits the constraints, and RLS lets
 * anonymous visitors read only what the site shows, with no Supabase project or Docker.
 */

const SUPABASE_STUBS = `
  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;
  create schema auth;
  create table auth.users (id uuid primary key);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  create schema storage;
  create table storage.buckets (
    id text primary key, name text, public boolean,
    file_size_limit bigint, allowed_mime_types text[]
  );
  create table storage.objects (id serial primary key, bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant usage on schema public, auth, storage to anon, authenticated;
  grant all on storage.objects to anon, authenticated;
  grant usage on all sequences in schema storage to anon, authenticated;
`;

const ADMIN = '00000000-0000-0000-0000-00000000000a';
const STRANGER = '00000000-0000-0000-0000-00000000000b';
type Role = 'anon' | 'authenticated';

const root = new URL('../../../supabase/', import.meta.url);
const read = (path: string) => readFileSync(new URL(path, root), 'utf8');
const migrations = readdirSync(new URL('migrations/', root))
  .filter((f) => f.endsWith('.sql'))
  .sort()
  .map((f) => read(`migrations/${f}`));

let db: PGlite;

// "Automatically expose new tables" on and off (project setting): default grants or none.
const AUTO_EXPOSE = `alter default privileges in schema public grant all on tables to anon, authenticated;`;

/** Runs `sql` as a role (and, signed in, as a user), then returns to the superuser. */
async function as<T>(role: Role, sql: string, user = '') {
  await db.exec(`set role ${role}; select set_config('request.jwt.claim.sub', '${user}', false);`);
  try {
    return (await db.query<T>(sql)).rows;
  } finally {
    await db.exec('reset role;');
  }
}

async function count(role: Role, table: string, user?: string) {
  const [row] = await as<{ n: number }>(role, `select count(*)::int as n from ${table}`, user);
  return row.n;
}

describe.each([{ autoExpose: true }, { autoExpose: false }])(
  'with auto-expose $autoExpose',
  ({ autoExpose }) => {
    beforeAll(async () => {
      db = new PGlite();
      await db.exec(SUPABASE_STUBS + (autoExpose ? AUTO_EXPOSE : ''));
      for (const sql of migrations) await db.exec(sql);
      await db.exec(read('seed.sql'));
      await db.exec(`
    insert into auth.users (id) values ('${ADMIN}'), ('${STRANGER}');
    insert into public.admin_user (user_id) values ('${ADMIN}');
    -- hidden rows the public must never see
    insert into public.project (id, title, kind, year) values ('hidden', 'H', 'side-project', 2026);
    insert into public.quote (id, text, author, active) values ('skipped', 'x', 'y', false);
    insert into public.article (slug, title, body) values ('a-draft', 'Draft', 'Not yet.');
    update public.experience set deleted_at = now() where id = 'gravel-logistics';
  `);
    }, 60_000);

    afterAll(() => db?.close());

    // Constraints don't depend on the grants, so they run once; RLS runs in both modes.
    if (autoExpose)
      describe('migrations + seed', () => {
        const d = defaultDataset;

        it('seed the shipped content and reject what the site cannot show', async () => {
          expect(await count('authenticated', 'public.project', ADMIN)).toBe(d.projects.length + 1);
          expect(await count('authenticated', 'public.article', ADMIN)).toBe(d.articles.length + 1);
          expect(await count('authenticated', 'public.quote', ADMIN)).toBe(d.quotes.length + 1);
          const [s] = await as<{ grain: string }>('anon', 'select grain from public.settings');
          expect(Number(s.grain)).toBe(d.settings.grain);

          const rejected = [
            `insert into public.quote (text, author) values ('${'x'.repeat(141)}', 'y')`,
            // published with neither a body nor an external URL
            `insert into public.article (slug, title, status) values ('empty', 'E', 'published')`,
            // a body and an external URL together
            `insert into public.article (slug, title, body, external_url)
         values ('both', 'B', 'x', 'https://medium.com/x')`,
            // live slugs are unique
            `insert into public.article (slug, title, body) values ('second-render', 'Dup', 'x')`,
            // exactly one profile
            `insert into public.profile (name, headline, about_lead, email, contact_statement)
         values ('a', 'b', 'c', 'd', 'e')`,
            `insert into public.experience (role, org, start_date, end_date)
         values ('r', 'o', '2024-01', '2023-01')`,
          ];
          for (const sql of rejected) await expect(db.exec(sql)).rejects.toThrow();

          // ...but a deleted slug can be reused
          await db.exec(`update public.article set deleted_at = now() where slug = 'a-draft'`);
          await db.exec(
            `insert into public.article (slug, title, body) values ('a-draft', 'D2', 'x')`,
          );
        });
      });

    describe('RLS', () => {
      const d = defaultDataset;

      it('anonymous visitors read only what the site shows, and write nothing', async () => {
        expect(await count('anon', 'public.project')).toBe(d.projects.length);
        expect(await count('anon', 'public.article')).toBe(d.articles.length);
        expect(await count('anon', 'public.quote')).toBe(d.quotes.length);
        expect(await count('anon', 'public.experience')).toBe(d.experience.length - 1);
        expect(await count('anon', 'public.profile')).toBe(1);
        await expect(count('anon', 'public.admin_user')).rejects.toThrow(); // no privilege at all
        for (const sql of [
          `insert into public.quote (text, author) values ('x', 'y')`,
          `update public.profile set name = 'hijacked'`,
          `delete from public.experience`,
          `insert into storage.objects (bucket_id, name) values ('media', 'x.png')`,
        ]) {
          await expect(as('anon', sql)).rejects.toThrow();
        }
      });

      it('only the allowlisted admin sees hidden rows and writes', async () => {
        // A signed-in stranger reads like the public and writes nothing.
        expect(await count('authenticated', 'public.project', STRANGER)).toBe(d.projects.length);
        const ignored = await as(
          'authenticated',
          `update public.profile set name = 'x' returning name`,
          STRANGER,
        );
        expect(ignored).toEqual([]);
        for (const sql of [
          `insert into public.quote (text, author) values ('x', 'y')`,
          `insert into storage.objects (bucket_id, name) values ('media', 'x.png')`,
        ]) {
          await expect(as('authenticated', sql, STRANGER)).rejects.toThrow();
        }

        expect(await count('authenticated', 'public.experience', ADMIN)).toBe(d.experience.length);
        const updated = await as(
          'authenticated',
          `update public.profile set footer_note = footer_note returning name`,
          ADMIN,
        );
        expect(updated).toHaveLength(1);
        await as(
          'authenticated',
          `insert into storage.objects (bucket_id, name) values ('media', 'cover.webp')`,
          ADMIN,
        );
      });
    });
  },
);

describe('the server role', () => {
  it('reads and writes every table, hidden rows included', async () => {
    const db = new PGlite();
    await db.exec(SUPABASE_STUBS);
    for (const sql of migrations) await db.exec(sql);
    await db.exec(`
      insert into public.quote (id, text, author, active) values ('off', 'x', 'y', false);
      set role service_role;
    `);
    const { rows } = await db.query<{ n: number }>('select count(*)::int n from public.quote');
    expect(rows[0].n).toBe(1);
    await db.exec(`update public.quote set active = true; select * from public.admin_user;`);
    await db.close();
  });
});
