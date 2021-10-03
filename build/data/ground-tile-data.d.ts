import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';
export declare class GroundTileData implements DataPacket {
    /**
     * The X coordinate of this tile.
     */
    x: number;
    /**
     * The Y coordinate of this tile.
     */
    y: number;
    /**
     * The tile type of this tile.
     */
    type: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
