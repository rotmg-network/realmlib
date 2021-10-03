import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to change the client's account name.
 */
export declare class ChooseNamePacket implements Packet {
    readonly type = PacketType.CHOOSENAME;
    /**
     * The name to change the account's name to.
     */
    name: string;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
