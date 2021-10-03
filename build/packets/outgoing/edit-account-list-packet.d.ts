import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to edit an account id list.
 */
export declare class EditAccountListPacket implements Packet {
    readonly type = PacketType.EDITACCOUNTLIST;
    /**
     * The id of the account id list being edited.
     */
    accountListId: number;
    /**
     * Whether the edit is to add to the list or remove from it.
     */
    add: boolean;
    /**
     * The object id of the player to add to the list.
     */
    objectId: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
}
