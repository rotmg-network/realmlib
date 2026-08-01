import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** One customisation-socket selection in a {@link BuyCustomisationSocketPacket}. */
export class CustomisationSocketSelection {
  /** Customisation category. */
  category: number;
  /** Customisation item type; every observed value resolves in objects.xml. */
  itemType: number;
  /** Currency selector used for the purchase. */
  currency: number;

  constructor(category = 0, itemType = 0, currency = 0) {
    this.category = category;
    this.itemType = itemType;
    this.currency = currency;
  }

  /** @deprecated Use {@link CustomisationSocketSelection.category}. */
  get unknownByte(): number {
    return this.category;
  }

  set unknownByte(value: number) {
    this.category = value;
  }

  /** @deprecated Use {@link CustomisationSocketSelection.currency}. */
  get unknownByte2(): number {
    return this.currency;
  }

  set unknownByte2(value: number) {
    this.currency = value;
  }
}

/** @deprecated Use {@link CustomisationSocketSelection}. */
export interface LegacyCustomisationSocketSelection {
  unknownByte: number;
  itemType: number;
  unknownByte2: number;
}

/**
 * Sent to apply/buy one or more customisation sockets (cloths, flipbook styles,
 * dyes). Registered but unmodelled until the 2026-07-27 full session log; the
 * earlier slices miss it.
 *
 * Wire format: `short count`, then count ×
 * `{ u8 category, int32 itemType, u8 currency }`.
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
 * Current native field types independently confirm the int32 item type and the
 * two unsigned byte fields. Captures identify category/currency values 0 and 1;
 * unknown values remain raw numeric values.
 */
export class BuyCustomisationSocketPacket implements Packet {
  readonly type = PacketType.BUY_CUSTOMISATION_SOCKET;

  //#region packet-specific members
  private _selections: CustomisationSocketSelection[];
  /** The customisation selections being applied. */
  get selections(): CustomisationSocketSelection[] {
    return this._selections;
  }

  set selections(
    selections: Array<CustomisationSocketSelection | LegacyCustomisationSocketSelection>,
  ) {
    this._selections = selections.map((selection) =>
      selection instanceof CustomisationSocketSelection
        ? selection
        : new CustomisationSocketSelection(
            selection.unknownByte,
            selection.itemType,
            selection.unknownByte2,
          ),
    );
  }
  //#endregion

  constructor() {
    this._selections = [];
  }

  read(reader: Reader): void {
    const count = reader.validateCollectionCount(reader.readShort(), 6, 'customisation selections');
    const selections = new Array<CustomisationSocketSelection>(count);
    for (let i = 0; i < count; i++) {
      selections[i] = new CustomisationSocketSelection(
        reader.readUnsignedByte(),
        reader.readInt32(),
        reader.readUnsignedByte(),
      );
    }
    this._selections = selections;
  }

  write(writer: Writer): void {
    writer.writeShort(this._selections.length);
    for (const selection of this._selections) {
      writer.writeUnsignedByte(selection.category);
      writer.writeInt32(selection.itemType);
      writer.writeUnsignedByte(selection.currency);
    }
  }
}
