import { WorldPosData } from '../../data/world-pos-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when a visible enemy shoots a projectile.
 */
export declare class EnemyShootPacket implements Packet {
    readonly type = PacketType.ENEMYSHOOT;
    /**
     * The id of the bullet which was fired.
     */
    bulletId: number;
    /**
     * The object id of the enemy which fired the projectile.
     */
    ownerId: number;
    /**
     * The local identifier of the projectile.
     * @see `ProjectileInfo.id`
     */
    bulletType: number;
    /**
     * The position at which the projectile was fired.
     */
    startingPos: WorldPosData;
    /**
     * The angle at which the projectile was fired.
     */
    angle: number;
    /**
     * The damage which the projectile will cause.
     */
    damage: number;
    /**
     * The number of projeciles fired.
     */
    numShots: number;
    /**
     * The angle in degrees between the projectiles if `numShots > 1`.
     */
    angleInc: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
