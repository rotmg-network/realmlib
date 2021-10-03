import { WorldPosData } from '../../data/world-pos-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when an AoE grenade has hit the ground.
 */
export declare class AoePacket implements Packet {
    readonly type = PacketType.AOE;
    /**
     * The position which the grenade landed at.
     */
    pos: WorldPosData;
    /**
     * The radius of the grenades area of effect, in game tiles.
     */
    radius: number;
    /**
     * The damage dealt by the grenade.
     */
    damage: number;
    /**
     * The condition effect applied by the grenade.
     */
    effect: number;
    /**
     * The duration of the effect applied.
     * @see `AoePacket.effect`.
     */
    duration: number;
    /**
     * > Unknown.
     */
    origType: number;
    /**
     * The color of the grenade's explosion particles.
     * > The encoding of the color is unknown.
     */
    color: number;
    /**
     * Whether or not the damage of this grenade pierces armor.
     */
    armorPiercing: boolean;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
