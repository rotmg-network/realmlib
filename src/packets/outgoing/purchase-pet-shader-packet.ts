import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to purchase a pet shader. Layout from the 6.12.0.2.0 client binary
 * (class `FJJMFDFNMLL`, vtable id 193): two int32s. The first shares its
 * field token with `ChangePetSkinPacket.petId`; the catalog pairs
 * `PurchasePetShader` with `PetShaderPurchaseResult` (incoming 194).
 * No wire capture exists yet.
 */
export class PurchasePetShaderPacket implements Packet {
  readonly type = PacketType.PURCHASE_PET_SHADER;

  //#region packet-specific members
  /** The pet instance id (token-matched with ChangePetSkin's petId). */
  petId: number;
  /** Second int32; likely the shader/skin type, unconfirmed. */
  unknownInt: number;
  //#endregion

  constructor() {
    this.petId = 0;
    this.unknownInt = 0;
  }

  read(reader: Reader): void {
    this.petId = reader.readInt32();
    this.unknownInt = reader.readInt32();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.petId);
    writer.writeInt32(this.unknownInt);
  }
}
