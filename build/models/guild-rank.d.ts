/**
 * The types of guild ranks mapped to their corresponding ID number
 */
export declare enum GuildRank {
    NoRank = -1,
    Initiate = 0,
    Member = 10,
    Officer = 20,
    Leader = 30,
    Founder = 40
}
/**
 * Return the readable rank name based from the rank ID
 * @param rank
 */
export declare function parseGuildRank(rank: number): string;
