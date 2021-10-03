import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
/**
 * Sent to reset the daily quests currently available.
 */
export declare class ResetDailyQuestsPacket implements Packet {
    readonly type = PacketType.RESET_DAILY_QUESTS;
    write(): void;
    read(): void;
}
