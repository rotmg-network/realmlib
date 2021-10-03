import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when another player shoots a projectile.
 */
export declare class AllyShootPacket implements Packet {
    readonly type = PacketType.ALLYSHOOT;
    /**
     * The bullet id of the projectile which was produced.
     */
    bulletId: number;
    /**
     * The object id of the player who fired the projectile.
     */
    ownerId: number;
    /**
     * The item id of the weapon used to fire the projectile.
     */
    containerType: number;
    /**
     * The angle at which the projectile was fired.
     */
    angle: number;
    /**
     * Whether or not the shot is affected by the 'Inspired' buff (presumably).
     */
    bard: boolean;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
