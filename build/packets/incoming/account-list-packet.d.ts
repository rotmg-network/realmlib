import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received to provide lists of accounts ids which are
 * those of players who have been locked, ignored, etc.
 */
export declare class AccountListPacket implements Packet {
    readonly type = PacketType.ACCOUNTLIST;
    /**
     * The id of the account id list.
     */
    accountListId: number;
    /**
     * The account ids included in the list.
     */
    accountIds: string[];
    /**
     * > Unknown.
     */
    lockAction: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
