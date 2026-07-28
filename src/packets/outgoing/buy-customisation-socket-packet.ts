import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** One customisation-socket selection in a {@link BuyCustomisationSocketPacket}. */
export interface CustomisationSocketSelection {
  /**
   * Leading byte. Observed 0, 0, 1 across the batch of three; 0 on both dyes.
   * Purpose not separable from `unknownByte2` in the capture — plausibly a
   * socket index or a category — so it is left unnamed.
   */
  unknownByte: number;
  /** Customisation item type; every observed value resolves in objects.xml. */
  itemType: number;
  /**
   * Trailing byte. Observed 0, 0, 0 / 1 / 1, 1 — trailing 1 lands exactly on the
   * two dyes. Plausibly apply/clear or a category; left unnamed.
   */
  unknownByte2: number;
}

/**
 * Sent to apply/buy one or more customisation sockets (cloths, flipbook styles,
 * dyes). Registered but unmodelled until the 2026-07-27 full session log; the
 * earlier slices miss it.
 *
 * Wire format: `short count`, then count × `{ byte, int32 itemType, byte }`.
 * Captured bodies (count + entries):
 *
 * ```
 * 0003  00 000012cf 00   00 00001394 00   01 00003113 00
 * 0001  00 00001026 01
 * 0002  00 00001026 01   00 00001107 01
 * ```
 *
 * The types resolve as 0x12CF Large Void Spirals Cloth, 0x1394 Small Terminal
 * Cloth, 0x3113 High Lime Inferno Flipbook Style, 0x1026 Deep Pink Clothing Dye,
 * 0x1107 Black Accessory Dye — which is what makes the framing certain. A second
 * session (19:40) round-trips two more bodies verbatim — `0001 00 00001007 01`
 * and `0002 00 00001007 01 00 00001311 01` — each drawing a `141` reply of
 * `01 0000`, confirming the framing against independent bytes.
 *
 * Caveat: because every observed type is < 65536, an `int32 at offset 1` and a
 * `short at offset 3` are indistinguishable here. The int32 reading is chosen
 * because every other customisation packet in this build (`RESKIN`, `RETITLE`,
 * `PET_CHANGE_SKIN_MSG`) writes item types as int32; a single customisation type
 * >= 65536 would settle it.
 */
export class BuyCustomisationSocketPacket implements Packet {
  readonly type = PacketType.BUY_CUSTOMISATION_SOCKET;

  //#region packet-specific members
  /** The customisation selections being applied. */
  selections: CustomisationSocketSelection[];
  //#endregion

  constructor() {
    this.selections = [];
  }

  read(reader: Reader): void {
    const count = reader.validateCollectionCount(reader.readShort(), 6, 'customisation selections');
    this.selections = new Array<CustomisationSocketSelection>(count);
    for (let i = 0; i < count; i++) {
      this.selections[i] = {
        unknownByte: reader.readByte(),
        itemType: reader.readInt32(),
        unknownByte2: reader.readByte(),
      };
    }
  }

  write(writer: Writer): void {
    writer.writeShort(this.selections.length);
    for (const selection of this.selections) {
      writer.writeByte(selection.unknownByte);
      writer.writeInt32(selection.itemType);
      writer.writeByte(selection.unknownByte2);
    }
  }
}
