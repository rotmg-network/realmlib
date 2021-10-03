import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received in response to a `ClaimDailyRewardMessage`.
 */
export declare class ClaimDailyRewardResponse implements Packet {
    readonly type = PacketType.LOGIN_REWARD_MSG;
    /**
     * The item id of the reward received.
     */
    itemId: number;
    /**
     * The number of items received.
     */
    quantity: number;
    /**
     * Unknown.
     */
    gold: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
