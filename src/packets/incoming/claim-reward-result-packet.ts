import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Current build packet 235 (server -> client), sent in response to
 * `ClaimRewardPacket`. The body is a success bool followed by a string holding
 * an XML reward payload, e.g.
 * `<Success><Tier>1</Tier><Rewards><Item><Id>3177</Id>...`.
 */
export class ClaimRewardResultPacket implements Packet {

  readonly type = PacketType.CLAIM_REWARD_RESULT;

  //#region packet-specific members
  /** Whether the claim succeeded. */
  success: boolean;
  /** The XML reward payload. */
  xml: string;
  /** A trailing short (observed as 0). Purpose not yet confirmed. */
  unknownShort: number;
  //#endregion

  constructor() {
    this.success = false;
    this.xml = '';
    this.unknownShort = 0;
  }

  /**
   * Backward-compatible numeric alias for {@link success}.
   * @deprecated The leading byte is a boolean success flag.
   */
  get unknownByte(): number {
    return this.success ? 1 : 0;
  }

  set unknownByte(value: number) {
    this.success = value !== 0;
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    this.xml = reader.readString();
    this.unknownShort = reader.readShort();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    writer.writeString(this.xml);
    writer.writeShort(this.unknownShort);
  }
}
