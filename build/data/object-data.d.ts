import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';
import { ObjectStatusData } from './object-status-data';
export declare class ObjectData implements DataPacket {
    /**
     * The type of this object
     */
    objectType: number;
    /**
     * The status of this object
     */
    status: ObjectStatusData;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
