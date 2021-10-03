import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when a new ability has been unlocked by the player.
 */
export declare class NewAbilityMessage implements Packet {
    readonly type = PacketType.NEW_ABILITY;
    /**
     * The type of ability which has been unlocked.
     */
    abilityType: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
