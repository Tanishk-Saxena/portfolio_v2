import { networkInterfaces } from 'node:os';
import type { NextConfig } from 'next';

/**
 * This machine's own LAN addresses. The dev server only serves its JS to `localhost` by
 * default, so a phone opening http://<lan-ip>:3000 got the HTML but never hydrated (no
 * theme toggle, modal, Show more…). Read at startup so a new DHCP lease still works.
 * Dev only: production serves assets to any origin.
 */
const lanAddresses = Object.values(networkInterfaces())
  .flat()
  .filter((net) => net && net.family === 'IPv4' && !net.internal)
  .map((net) => net!.address);

/**
 * Uploaded images (portrait, project covers) live in the Supabase project's public `media`
 * bucket (ADMIN-DESIGN-SPEC §10); `next/image` may optimise those and nothing else remote.
 * The project comes from the environment, so dev and prod each allow their own.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const mediaPattern = supabaseUrl
  ? [new URL('/storage/v1/object/public/media/**', supabaseUrl)]
  : [];

const nextConfig: NextConfig = {
  allowedDevOrigins: lanAddresses,
  images: { remotePatterns: mediaPattern },
};

export default nextConfig;
