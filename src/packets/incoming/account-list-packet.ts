import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { AccountListAction } from '../../models';

/**
 * Received to provide lists of accounts ids which are
 * those of players who have been locked, ignored, etc.
 */
export class AccountListPacket implements Packet {
  readonly type = PacketType.ACCOUNTLIST;

  //#region packet-specific members
  /**
   * The id of the account id list.
   */
  accountListId: number;
  /**
   * The account ids included in the list.
   */
  accountIds: string[];
  /** Snapshot (-1), remove (0), or add (1). Unknown values remain numeric. */
  lockAction: number;
  //#endregion

  constructor() {
    this.accountListId = 0;
    this.accountIds = [];
    this.lockAction = AccountListAction.Snapshot;
  }

  /** Typed compatibility view of {@link AccountListPacket.lockAction}. */
  get action(): AccountListAction {
    return this.lockAction as AccountListAction;
  }

  set action(value: AccountListAction) {
    this.lockAction = value;
  }

  isSnapshot(): boolean {
    return this.lockAction === AccountListAction.Snapshot;
  }

  isAddition(): boolean {
    return this.lockAction === AccountListAction.Add;
  }

  isRemoval(): boolean {
    return this.lockAction === AccountListAction.Remove;
  }

  read(reader: Reader): void {
    this.accountListId = reader.readInt32();
    const accountIdsLen = reader.validateCollectionCount(reader.readShort(), 2, 'account list');
    this.accountIds = new Array<string>(accountIdsLen);
    for (let i = 0; i < accountIdsLen; i++) {
      this.accountIds[i] = reader.readString();
    }
    this.lockAction = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.accountListId);
    writer.writeShort(this.accountIds.length);
    for (const id of this.accountIds) {
      writer.writeString(id);
    }
    writer.writeInt32(this.lockAction);
  }
}
