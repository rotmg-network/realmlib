import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';
export declare class StatData implements DataPacket {
    /**
     * The type of stat
     */
    statType: number;
    /**
     * The number value of this stat, if this is not a string stat
     */
    statValue: number;
    /**
     * The string value of this stat, if this is a string stat
     */
    stringStatValue: string;
    /**
     * Unknown, possibly a format checksum
     */
    magicByte: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
    /**
     * Return whether or not the current stat has a string value
     */
    isStringStat(): boolean;
    /**
     * Return the name of a current stat or another stat based on it's value
     * @param statType The ID of the stat type (optional)
     */
    statToName(statType?: number): string;
}
