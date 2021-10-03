import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received in response to a `CreatePacket`
 */
export declare class CreateSuccessPacket implements Packet {
    readonly type = PacketType.CREATE_SUCCESS;
    /**
     * The object id of the player's character
     */
    objectId: number;
    /**
     * The character id of the player's character
     */
    charId: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
