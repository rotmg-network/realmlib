import { WorldPosData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received to tell the player to display an effect such as an AOE grenade
 */
export declare class ShowEffectPacket implements Packet {
    readonly type = PacketType.SHOWEFFECT;
    /**
     * The type of effect to display
     */
    effectType: number;
    /**
     * The objectId the effect is targeting
     */
    targetObjectId: number;
    /**
     * > Unknown. Probably the start position of the effect
     */
    pos1: WorldPosData;
    /**
     * > Unknown. Probably the end position of the effect
     */
    pos2: WorldPosData;
    /**
     * The color of the effect
     */
    color: number;
    /**
     * The duration of the effect
     */
    duration: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
