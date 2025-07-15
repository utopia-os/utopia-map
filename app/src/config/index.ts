export const config = {
  apiUrl: String(import.meta.env.VITE_API_URL ?? 'https://api.utopia-lab.org'),
  validateInviteFlowId: String(
    import.meta.env.VITE_VALIDATE_INVITE_FLOW_ID ?? '01d61db0-25aa-4bfa-bc24-c6a8f208a455',
  ),
  redeemInviteFlowId: String(
    import.meta.env.VITE_REDEEM_INVITE_FLOW_ID ?? 'cc80ec73-ecf5-4789-bee5-1127fb1a6ed4',
  ),
  openCollectiveApiKey: String(import.meta.env.VITE_OPEN_COLLECTIVE_API_KEY ?? ''),
}

export type Config = typeof config
