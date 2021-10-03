import { Writer } from '../writer';
import { Reader } from '../reader';
import { DataPacket } from '../packet';
import { Point } from '../models';
export declare class WorldPosData implements DataPacket, Point {
    x: number;
    y: number;
    /**
     * Creates a new point at the origin or at the provided, x, y.
     * @param x An x value for this point. Defaults to 0
     * @param y A y value for this point. Defaults to 0
     */
    constructor(x?: number, y?: number);
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
    /**
     * Returns the square distance between this point and the other point.
     * @param point The other point.
     */
    squareDistanceTo<T extends Point>(point: T): number;
    /**
     * Returns the distance between this point and the other point.
     * @param point The other point.
     */
    distanceTo<T extends Point>(point: T): number;
    /**
     * Returns a new `Point` which has the same x and y values.
     */
    clone(): WorldPosData;
}
