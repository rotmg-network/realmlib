import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received to tell the player about damage done to other players and enemies.
 */
export declare class DamagePacket implements Packet {
    readonly type = PacketType.DAMAGE;
    /**
     * The object id of the entity receiving the damage.
     */
    targetId: number;
    /**
     * An array of status effects which were applied with the damage.
     */
    effects: number[];
    /**
     * The amount of damage taken.
     */
    damageAmount: number;
    /**
     * Whether or not the damage resulted in killing the entity.
     */
    kill: boolean;
    /**
     * Whether or not the damage was armor piercing.
     */
    armorPierce: boolean;
    /**
     * The id of the bullet which caused the damage.
     */
    bulletId: number;
    /**
     * The object id of the entity which owned the bullet that caused the damage.
     */
    objectId: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
