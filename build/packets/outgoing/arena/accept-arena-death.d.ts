import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
/**
 * Sent to accept a death in the arena.
 */
export declare class AcceptArenaDeathPacket implements Packet {
    readonly type = PacketType.ACCEPT_ARENA_DEATH;
    propagate: boolean;
    write(): void;
    read(): void;
}
