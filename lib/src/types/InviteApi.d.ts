export interface InviteApi {
  validateInvite(inviteId: string): Promise<string | null>
  redeemInvite(inviteId: string, itemId: string): Promise<string | null>
}
