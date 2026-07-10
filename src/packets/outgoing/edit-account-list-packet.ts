import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to add or remove a player from one of the account-id lists (lock /
 * ignore). Fire-and-forget: in captures the server sent **no** per-edit
 * `AccountListPacket` acknowledgement — the updated list is only pushed on
 * (re)connect.
 *
 * The target is given as a **transient object id**, so the player must be
 * currently visible; the server resolves it to an account id (the list in
 * `AccountListPacket` is keyed by account-id strings).
 */
export class EditAccountListPacket implements Packet {

  readonly type = PacketType.EDITACCOUNTLIST;

  //#region packet-specific members
  /**
   * Which list to edit — see {@link AccountListType}: `0` = lock list,
   * `1` = ignore list.
   */
  accountListId: number;
  /**
   * `true` to add the player to the list, `false` to remove them (confirmed
   * by captures toggling the same player on and off a list).
   */
  add: boolean;
  /**
   * The transient object id of the (currently visible) player to add/remove.
   */
  objectId: number;
  //#endregion

  constructor() {
    this.accountListId = 0;
    this.add = false;
    this.objectId = 0;
  }

  write(writer: Writer): void {
    writer.writeInt32(this.accountListId);
    writer.writeBoolean(this.add);
    writer.writeInt32(this.objectId);
  }

  read(reader: Reader): void {
    this.accountListId = reader.readInt32();
    this.add = reader.readBoolean();
    this.objectId = reader.readInt32();
  }
}
