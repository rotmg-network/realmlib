import { Packet } from "../../packet";
import { PacketType } from "../../packet-type";
import { Reader } from "../../reader";
import { Writer } from "../../writer";
import { SlotObjectData } from '../../data';

/**
* Received when the player uses the item forge
*/
export class ForgeResultPacket implements Packet {
  readonly type = PacketType.FORGE_RESULT;

  /**
   * Whether the forge was successful
   */
  success: boolean;
  /**
   * The SlotObjectData of the items forged
   */
  results: SlotObjectData[];


  constructor() {
    this.success = false;
    this.results = [];
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();

    let resultCount = reader.readByte();
    for (let i = 0; i < resultCount; i++) {
      let result = new SlotObjectData();
      result.read(reader)
      this.results[i] = result;
    }
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);

    for (let i = 0; this.results.length; i++) {
      this.results[i].write(writer);
    }
  }

  toString(): string {
    let str = `[ForgeResult - 119] Success: ${this.success}\n`;

    if (this.results.length == 0) {
      return str + `Results: No SlotObjectData`;
    }
    for(let i = 0; i < this.results.length; i++) {
      if (i == (this.results.length - 1)) {
        str += this.results[i].toString();
      } else {
        str += this.results[i].toString() + `\n`;
      }
    }
    return str;
  }
}
