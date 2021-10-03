import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
/**
 * > Unknown.
 */
export declare class CheckCreditsPacket implements Packet {
    readonly type = PacketType.CHECKCREDITS;
    write(): void;
    read(): void;
}
