import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * > Unknown.
 */
export declare class GuildResultPacket implements Packet {
    readonly type = PacketType.GUILDRESULT;
    /**
     * > Unknown.
     */
    success: boolean;
    /**
     * > Unknown.
     */
    lineBuilderJSON: string;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
