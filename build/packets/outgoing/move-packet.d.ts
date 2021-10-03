import { MoveRecord } from '../../data';
import { WorldPosData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to acknowledge a `NewTickPacket`, and to notify the
 * server of the client's current position and time.
 */
export declare class MovePacket implements Packet {
    readonly type = PacketType.MOVE;
    /**
     * The tick id of the `NewTickPacket` which this is acknowledging.
     */
    tickId: number;
    /**
     * The current client time.
     */
    time: number;
    /**
     * The current server time in ms.
     */
    serverRealTimeMS: number;
    /**
     * The current client position.
     */
    newPosition: WorldPosData;
    /**
     * The move records of the client.
     *
     * This property can be an empty array.
     */
    records: MoveRecord[];
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
