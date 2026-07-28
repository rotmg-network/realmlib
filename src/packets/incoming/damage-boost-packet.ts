import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received when a damage boost applies to an entity. Layout from the
 * 6.12.0.2.0 client binary (class `BAFOHBEMLCK`, vtable id 148, catalog
 * `DamageBoostMessage`): an object id (token-verified against Text/
 * QuestObjectId/Damage) and a float value — presumably the boost multiplier
 * or amount. No wire capture exists yet.
 */
export class DamageBoostPacket implements Packet {
  readonly type = PacketType.DAMAGE_BOOST;

  //#region packet-specific members
  /** The object id of the boosted entity. */
  objectId: number;
  /** The boost value; multiplier or amount, unconfirmed. */
  value: number;
  //#endregion

  constructor() {
    this.objectId = 0;
    this.value = 0;
  }

  read(reader: Reader): void {
    this.objectId = reader.readInt32();
    this.value = reader.readFloat();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.objectId);
    writer.writeFloat(this.value);
  }
}
