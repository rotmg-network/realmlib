import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received when an entity enters, updates, or leaves stasis.
 *
 * Decoded from ten samples in the 2026-07-27 19:40 session, all 20 bytes:
 *
 * ```
 * 000003af 01 16 0000 00000000 ffffff16 40e00000   obj 943, 7.0s
 * 000003af 01 16 0000 00000000 ffffff16 403e7f0a   obj 943, ~2.98s (update)
 * 00000561 01 16 0000 00000000 ffffff16 00000000   obj 1377, 0s (removal)
 * ```
 *
 * `effectId` is 22 = the classic Stasis condition-effect index in every sample.
 * The trailing float is the remaining duration in seconds — the same object was
 * seen at 7.0 then ~2.98 (countdown), and 0.0 clears the stasis. The middle
 * bytes were constant `01 …zeros… ffffff16` across all ten samples; `0xffffff16`
 * reads as either an RGBA tint (white, alpha 22) or a `ffffff` sentinel plus an
 * echo of the effect id — the capture cannot separate the two, so the fields
 * stay unnamed.
 */
export class StasisPacket implements Packet {

  readonly type = PacketType.STASIS;

  //#region packet-specific members
  /** Object id of the entity in stasis. */
  objectId: number;
  /** A byte observed as 1 in every sample — possibly an entry count or flag. */
  unknownByte: number;
  /** Condition-effect index; 22 (Stasis) in every sample. */
  effectId: number;
  /** A short observed as 0. */
  unknownShort: number;
  /** An int32 observed as 0. */
  unknownInt: number;
  /** Observed constant `0xffffff16` — an RGBA tint or sentinel + effect echo. */
  unknownInt2: number;
  /** Remaining stasis duration in seconds; 0 when the stasis ends. */
  durationSeconds: number;
  //#endregion

  constructor() {
    this.objectId = 0;
    this.unknownByte = 1;
    this.effectId = 22;
    this.unknownShort = 0;
    this.unknownInt = 0;
    this.unknownInt2 = -234; // 0xffffff16 as signed int32
    this.durationSeconds = 0;
  }

  read(reader: Reader): void {
    this.objectId = reader.readInt32();
    this.unknownByte = reader.readByte();
    this.effectId = reader.readByte();
    this.unknownShort = reader.readShort();
    this.unknownInt = reader.readInt32();
    this.unknownInt2 = reader.readInt32();
    this.durationSeconds = reader.readFloat();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.objectId);
    writer.writeByte(this.unknownByte);
    writer.writeByte(this.effectId);
    writer.writeShort(this.unknownShort);
    writer.writeInt32(this.unknownInt);
    writer.writeInt32(this.unknownInt2);
    writer.writeFloat(this.durationSeconds);
  }
}
