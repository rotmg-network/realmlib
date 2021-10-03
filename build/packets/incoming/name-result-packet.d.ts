import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received in response to a `ChooseNamePacket`
 */
export declare class NameResultPacket implements Packet {
    readonly type = PacketType.NAMERESULT;
    /**
     * Whether or not the name change was successful
     */
    success: boolean;
    /**
     * The error which occurred, if the result was not successful
     */
    errorText: string;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
