import { FailureCode } from '../../models';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when an error has occurred
 */
export declare class FailurePacket implements Packet {
    readonly type = PacketType.FAILURE;
    /**
     * The error ID code of the failure
     */
    errorId: FailureCode;
    /**
     * A description of the error
     */
    errorDescription: string;
    /**
     * The place where the error occurred
     */
    errorPlace: string;
    /**
     * The ID of the connection in which the error occurred
     */
    errorConnectionId: string;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
