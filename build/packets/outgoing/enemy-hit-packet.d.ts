import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent when an enemy has been hit by the player.
 */
export declare class EnemyHitPacket implements Packet {
    readonly type = PacketType.ENEMYHIT;
    /**
     * The current client time.
     */
    time: number;
    /**
     * The id of the bullet which hit the enemy.
     */
    bulletId: number;
    /**
     * The object id of the enemy which was hit.
     */
    targetId: number;
    /**
     * Whether or not the projectile will kill the enemy.
     */
    kill: boolean;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
