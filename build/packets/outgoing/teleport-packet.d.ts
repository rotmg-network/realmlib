import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to teleport to another player.
 */
export declare class TeleportPacket implements Packet {
    readonly type = PacketType.TELEPORT;
    /**
     * The object id of the player to teleport to.
     */
    objectId: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
