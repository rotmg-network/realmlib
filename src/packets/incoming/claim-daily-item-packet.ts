import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Current build packet 237 - structure is `byte + string + string`
 *
 * The first string is a base64-encoded Google Cloud Datastore key/cursor
 * one captured value decodes to a key path through `Account` → `DailyLoginData`
 * 
 * and the second is a category label (`"nonconsecutive"`, `"all"`). It appears
 * to carry daily-login / login-calendar state, alongside the `CLAIM_LOGIN_REWARD_MSG` flow. 
 * 
 * Named as unknown pending confirmation; the three fields decode and round-trip regardless.
 */
export class ClaimDailyItemPacket implements Packet {

  readonly type = PacketType.CLAIM_DAILY_ITEM;

  //#region packet-specific members

  /** A leading flag byte (observed `1`). */
  flag: number;

  /**
   * A base64-encoded datastore key/cursor (observed decoding to an
   * `Account`/`DailyLoginData` key path). May be empty.
   */
  key: string;

  /** A category label — observed `"nonconsecutive"` and `"all"`. */
  category: string;
  
  //#endregion

  constructor() {
    this.flag = 0;
    this.key = '';
    this.category = '';
  }

  read(reader: Reader): void {
    this.flag = reader.readByte();
    this.key = reader.readString();
    this.category = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeByte(this.flag);
    writer.writeString(this.key);
    writer.writeString(this.category);
  }
}
