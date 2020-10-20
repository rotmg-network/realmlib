import { Packet } from "../../packet";
import { PacketType } from "../../packet-type";
import { Reader } from "../../reader";
import { read as compressedRead } from "../../data/compressed-int";
import { Writer } from "../../writer";

/**
 * Received for information when the player enters the new vault
 */
export class VaultUpdatePacket implements Packet {
  readonly type = PacketType.VAULT_UPDATE;

  vaultContents: number[];

  giftContents: number[];

  potionContents: number[];

  vaultUpgradeCost: number;

  potionUpgradeCost: number;

  currentPotionMax: number;

  nextPotionMax: number;

  constructor() {
    this.vaultContents = [];
    this.giftContents = [];
    this.potionContents = [];
    this.vaultUpgradeCost = 0;
    this.potionUpgradeCost = 0;
    this.currentPotionMax = 0;
    this.nextPotionMax = 0;
  }

  read(reader: Reader): void {
    let counter = 0;

    //compressedRead(reader);
    //compressedRead(reader);
    //compressedRead(reader);
    //compressedRead(reader);

    let itemCount = compressedRead(reader);
    while (counter < itemCount) {
      this.vaultContents.push(compressedRead(reader));
      counter++;
    }
    let giftItemCount = compressedRead(reader);
    counter = 0;
    while (counter < giftItemCount) {
      this.giftContents.push(compressedRead(reader));
      counter++;
    }
    let potionCount = compressedRead(reader);
    counter = 0;
    while (counter < potionCount) {
      this.potionContents.push(compressedRead(reader));
      counter++;
    }
    this.vaultUpgradeCost = reader.readShort();
    this.potionUpgradeCost = reader.readShort();
    this.currentPotionMax = reader.readShort();
    this.nextPotionMax = reader.readShort();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.vaultContents.length);
    for (const item of this.vaultContents) {
      writer.writeInt32(item);
    }
    writer.writeInt32(this.giftContents.length);
    for (const item of this.giftContents) {
      writer.writeInt32(item);
    }
    writer.writeInt32(this.potionContents.length);
    for (const item of this.potionContents) {
      writer.writeInt32(item);
    }
    writer.writeShort(this.vaultUpgradeCost);
    writer.writeShort(this.potionUpgradeCost);
    writer.writeShort(this.currentPotionMax);
    writer.writeShort(this.nextPotionMax);
  }
}
