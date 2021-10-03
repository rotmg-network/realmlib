import { WorldPosData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when another player shoots
 */
export declare class ServerPlayerShootPacket implements Packet {
    readonly type = PacketType.SERVERPLAYERSHOOT;
    /**
     * The id of the bullet that was produced
     */
    bulletId: number;
    /**
     * The object id of the player who fired the projectile
     */
    ownerId: number;
    /**
     * The item id of the weapon used to fire the projectile
     */
    containerType: number;
    /**
     * The starting position of the projectile
     */
    startingPos: WorldPosData;
    /**
     * The angle at which the projectile was fired
     */
    angle: number;
    /**
     * The damage which will be dealt by the projectile
     */
    damage: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
