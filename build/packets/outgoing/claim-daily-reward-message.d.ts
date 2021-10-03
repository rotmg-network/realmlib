import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to claim rewards from the login calendar.
 */
export declare class ClaimDailyRewardMessage implements Packet {
    readonly type = PacketType.CLAIM_LOGIN_REWARD_MSG;
    /**
     * The key of the item being claimed.
     */
    claimKey: string;
    /**
     * The type of claim being made.
     */
    claimType: string;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
