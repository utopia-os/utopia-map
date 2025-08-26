export const config = {
  apiUrl: String(import.meta.env.VITE_API_URL ?? 'http://localhost:8055/'),
  mapUrl: String(import.meta.env.VITE_MAP_URL ?? 'http://local.development'),
  adminRole: String(import.meta.env.VITE_DIRECTUS_ADMIN_ROLE ?? ''),
  validateInviteFlowId: String(
    import.meta.env.VITE_VALIDATE_INVITE_FLOW_ID ?? '01d61db0-25aa-4bfa-bc24-c6a8f208a455',
  ),
  redeemInviteFlowId: String(
    import.meta.env.VITE_REDEEM_INVITE_FLOW_ID ?? 'cc80ec73-ecf5-4789-bee5-1127fb1a6ed4',
  ),
  openCollectiveApiKey: String(import.meta.env.VITE_OPEN_COLLECTIVE_API_KEY ?? ''),
}

if (config.adminRole === '') {
  throw Error('You must define the Admin roll in the .env file!')
}

export type Config = typeof config
