import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received occasionally by the server to prompt a response from the client
 */
export declare class PingPacket implements Packet {
    readonly type = PacketType.PING;
    /**
     * A nonce value which is expected to be present in the reply
     */
    serial: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
