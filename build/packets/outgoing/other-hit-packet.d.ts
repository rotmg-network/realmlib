import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent when an object or other player has been hit by an enemy projectile.
 */
export declare class OtherHitPacket implements Packet {
    readonly type = PacketType.OTHERHIT;
    /**
     * The current client time.
     */
    time: number;
    /**
     * The id of the bullet which hit the object.
     */
    bulletId: number;
    /**
     * The object id of player who fired the projectile which hit the object.
     */
    objectId: number;
    /**
     * The object id of the object which was hit.
     */
    targetId: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
