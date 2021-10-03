import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent when the player is hit.
 */
export declare class PlayerHitPacket implements Packet {
    readonly type = PacketType.PLAYERHIT;
    /**
     * The id of the bullet which hit the player.
     */
    bulletId: number;
    /**
     * The object id of the enemy that hit the player.
     */
    objectId: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
