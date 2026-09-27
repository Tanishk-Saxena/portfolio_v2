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

const nextConfig: NextConfig = {
  allowedDevOrigins: lanAddresses,
};

export default nextConfig;
