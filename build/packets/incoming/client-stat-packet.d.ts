import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received to give the player information about their stats.
 */
export declare class ClientStatPacket implements Packet {
    readonly type = PacketType.CLIENTSTAT;
    /**
     * The name of the stat.
     */
    name: string;
    /**
     * The value of the stat.
     */
    value: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
