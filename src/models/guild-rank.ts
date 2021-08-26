/**
 * The types of guild ranks mapped to their corresponding ID number
 */
export enum GuildRank {
  NoRank = -1,
  Initiate = 0,
  Member = 10,
  Officer = 20,
  Leader = 30,
  Founder = 40
}

/**
 * Return the name of a guild rank based on the numerical ID
 * @param rank The rank ID
 */
export function parseGuildRank(rank: number): string {
  switch(rank) {
    case GuildRank.Initiate: return "Initiate";
    case GuildRank.Member: return "Member";
    case GuildRank.Officer: return "Officer";
    case GuildRank.Leader: return "Leader";
    case GuildRank.Founder: return "Founder";
    default: return "Unknown";
  }
}
