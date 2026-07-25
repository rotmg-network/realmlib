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
    Blacklisted = 6
}