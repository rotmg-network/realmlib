/**
 * Received when trying to join a party
 */
export enum PartyResponse {
  None = 0,
  Pending = 1,
  Cancelled = 2,
  Accepted = 3,
  Declined = 4,
  PartyFull = 5,
  Blacklisted = 6,
}

/** Actions a client can request for a party or party member. */
export enum PartyAction {
  None = 0,
  Kick = 1,
  Disconnect = 2,
  PromoteToLeader = 3,
  Refresh = 4,
  GetPartyList = 5,
  LeaveParty = 6,
  TeleportTo = 7,
}

/** Results reported after a party action request. */
export enum PartyActionResult {
  None = 0,
  Failed = 1,
  Kicked = 2,
  KickNotFound = 3,
  PromotedToLeader = 4,
  PromoteNotFound = 5,
  LeftParty = 6,
}

/**
 * Party access/visibility, from client enum `ICLDOIDKKOB` (build 6.12.0.2.0),
 * used by the create-party UI.
 */
export enum PartyAccess {
  None = 0,
  Public = 1,
  Private = 2,
}
