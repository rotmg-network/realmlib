import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when a player dies
 */
export declare class DeathPacket implements Packet {
    readonly type = PacketType.DEATH;
    /**
     * The account id of the player who died
     */
    accountId: string;
    /**
     * The character id of the player who died
     */
    charId: number;
    /**
     * The cause of death
     */
    killedBy: string;
    /**
     * The object id of the zombie, if the player died wearing a cursed amulet
     */
    zombieId: number;
    /**
     * The type of zombie, if the player died wearing a cursed amulet
     */
    zombieType: number;
    /**
     * Whether or not a zombie was spawned
     *
     * This is a derived property, and is the result of `zombieId !== -1`
     */
    isZombie: boolean;
    /**
     * Unknown exalt stat type
     */
    unknown: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
