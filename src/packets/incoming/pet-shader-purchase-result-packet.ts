import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to `PURCHASE_PET_SHADER` (193). Layout from the
 * 6.12.0.2.0 client binary (class `LPAKDPGHCHO`, incoming factory id 194):
 * a single result bool. Catalog name `PetShaderPurchaseResult`. No wire
 * capture exists yet.
 */
export class PetShaderPurchaseResultPacket implements Packet {
  readonly type = PacketType.PET_SHADER_PURCHASE_RESULT;

  //#region packet-specific members
  /** Whether the purchase succeeded. */
  result: boolean;
  //#endregion

  constructor() {
    this.result = false;
  }

  read(reader: Reader): void {
    this.result = reader.readBoolean();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.result);
  }
}
