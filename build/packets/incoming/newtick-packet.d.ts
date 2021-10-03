import { ObjectStatusData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received to notify the player of a new game tick
 */
export declare class NewTickPacket implements Packet {
    readonly type = PacketType.NEWTICK;
    /**
     * The id of the tick
     */
    tickId: number;
    /**
     * The time between the last tick and this tick, in milliseconds
     */
    tickTime: number;
    /**
     * Server realtime in ms
     */
    serverRealTimeMS: number;
    /**
     * Last server realtime in ms
     */
    serverLastTimeRTTMS: number;
    /**
     * An array of statuses for objects which are currently visible to the player
     */
    statuses: ObjectStatusData[];
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
