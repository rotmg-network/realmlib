import { GroundTileData, ObjectData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when an update even occurs. Some events include
 * + One or more new objects have entered the map (become visible)
 * + One or more objects have left the map (become invisible)
 * + New tiles are visible
 */
export declare class UpdatePacket implements Packet {
    readonly type = PacketType.UPDATE;
    /**
     * The new tiles which are visible.
     */
    tiles: GroundTileData[];
    /**
     * The new objects which have entered the map (become visible).
     */
    newObjects: ObjectData[];
    /**
     * The visible objects which have left the map (become invisible).
     */
    drops: number[];
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
