import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
/**
 * Received to prompt the player to verify their email.
 */
export declare class VerifyEmailPacket implements Packet {
    readonly type = PacketType.VERIFY_EMAIL;
    read(): void;
    write(): void;
}
