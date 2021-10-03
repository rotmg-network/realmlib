import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';
import { WorldPosData } from './world-pos-data';
import { StatData } from './stat-data';
export declare class ObjectStatusData implements DataPacket {
    /**
     * The object id of the object which this status is for
     */
    objectId: number;
    /**
     * The position of the object which this status is for
     */
    pos: WorldPosData;
    /**
     * A list of stats for the object which this status is for
     */
    stats: StatData[];
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(showStats?: boolean): string;
}
