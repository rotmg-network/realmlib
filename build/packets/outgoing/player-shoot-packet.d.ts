import { WorldPosData } from '../../data/world-pos-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent when the player shoots a projectile.
 */
export declare class PlayerShootPacket implements Packet {
    readonly type = PacketType.PLAYERSHOOT;
    /**
     * The current client time.
     */
    time: number;
    /**
     * The id of the bullet which was fired.
     */
    bulletId: number;
    /**
     * The item id of the weapon used to fire the projectile.
     */
    containerType: number;
    /**
     * The position at which the projectile was fired.
     */
    startingPos: WorldPosData;
    /**
     * The angle at which the projectile was fired.
     */
    angle: number;
    /**
     * The speed multiplier for the projectile (affected by Inspired).
     */
    speedMult: number;
    /**
     * The lifetime MS multiplier for the projectile (affected by Inspired?)
     */
    lifeMult: number;
    /**
     * If the projectile is a burst
     */
    isBurst: boolean;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
