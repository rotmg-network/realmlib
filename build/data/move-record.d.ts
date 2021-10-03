import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';
export declare class MoveRecord implements DataPacket {
    /**
     * The client time of this move record.
     */
    time: number;
    /**
     * The X coordinate of this move record.
     */
    x: number;
    /**
     * The Y coordinate of this move record.
     */
    y: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    clone(): MoveRecord;
}
