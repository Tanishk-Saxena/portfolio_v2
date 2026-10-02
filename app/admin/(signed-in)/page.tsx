import { redirect } from 'next/navigation';
import { ADMIN_START } from '@/lib/admin/sections';

/** `/admin` opens on Writing, as the mockup does (Q-A5). */
export default function AdminHome() {
  redirect(ADMIN_START);
}
