import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Account identity embedded in a gift notification. */
export interface GiftUserData {
  accountId: number;
  name: string;
}

/** JSON payload embedded in a gift notification. */
export interface GiftInfo {
  type: string;
  area: number;
  text: string;
  items: number[];
  from: GiftUserData;
  to: GiftUserData;
  createdAt: number;
}

/**
 * Announces an account gift (packet 238).
 *
 * The client consumes one int32 before the JSON string and does not retain it;
 * RealmLib exposes it as `unknownInt` so decoded packets can round-trip without
 * discarding wire data. `giftInfoJson` remains the authoritative lossless
 * representation while `giftInfo` provides the decoded managed shape.
 */
export class GiftNotificationPacket implements Packet {
  readonly type = PacketType.GIFT_NOTIFICATION;

  unknownInt: number;
  giftInfoJson: string;
  giftInfo: GiftInfo | null;

  constructor() {
    this.unknownInt = 0;
    this.giftInfoJson = '';
    this.giftInfo = null;
  }

  read(reader: Reader): void {
    this.unknownInt = reader.readInt32();
    this.giftInfoJson = reader.readString();
    try {
      this.giftInfo = this.giftInfoJson ? (JSON.parse(this.giftInfoJson) as GiftInfo) : null;
    } catch {
      // Preserve future or malformed payloads in giftInfoJson without turning
      // a packet decode into data loss.
      this.giftInfo = null;
    }
  }

  write(writer: Writer): void {
    writer.writeInt32(this.unknownInt);
    writer.writeString(
      this.giftInfoJson || (this.giftInfo === null ? '' : JSON.stringify(this.giftInfo)),
    );
  }
}
