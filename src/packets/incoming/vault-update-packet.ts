import { Packet } from "../../packet";
import { PacketType } from "../../packet-type";
import { Reader } from "../../reader";
import { CompressedInt } from "../../data/compressed-int";
import { Writer } from "../../writer";

/**
 * Received for information when the player enters the new vault
 */
export class VaultUpdatePacket implements Packet {
  readonly type = PacketType.VAULT_UPDATE;
  /**
   * Unknown.
   */
  unknownBool: boolean;
  /**
   * The amount of items in the player vault.
   */
  vaultItemCount: number;
  /**
   * The amount of items in the gift vault.
   */
  giftItemCount: number;
  /**
   * The amount of items in the potion vault.
   */
  potionItemCount: number;
  /**
   * The contents of the players vault, sent as an array of item object IDs or -1 if the slot is empty
   */
  vaultContents: number[];
  /**
   * The contents of the player's gift vault
   */
  giftContents: number[];
  /**
   * The contents of the player's potion vault
   */
  potionContents: number[];
  /**
   * The cost in gold for the next upgrade to the vault
   */
  vaultUpgradeCost: number;
  /**
   * The cost in gold for the next upgrade to the potion vault
   */
  potionUpgradeCost: number;
  /**
   * The current slot size of the player's potion vault
   */
  currentPotionMax: number;
  /**
   * The size of the player's potion vault after they purchase the current upgrade
   */
  nextPotionMax: number;

  constructor() {
    this.unknownBool = false;
    this.vaultContents = [];
    this.giftContents = [];
    this.potionContents = [];
    this.vaultUpgradeCost = 0;
    this.potionUpgradeCost = 0;
    this.currentPotionMax = 0;
    this.nextPotionMax = 0;
  }

  read(reader: Reader): void {
    this.unknownBool = reader.readBoolean();
    this.vaultItemCount = new CompressedInt().read(reader);
    this.giftItemCount = new CompressedInt().read(reader);
    this.potionItemCount = new CompressedInt().read(reader);

    let counter = 0;
    let itemCount = new CompressedInt().read(reader);
    while (counter < itemCount) {
      this.vaultContents.push(new CompressedInt().read(reader));
      counter++;
    }

    let giftItemCount = new CompressedInt().read(reader);
    counter = 0;
    while (counter < giftItemCount) {
      this.giftContents.push(new CompressedInt().read(reader));
      counter++;
    }

    let potionCount = new CompressedInt().read(reader);
    counter = 0;
    while (counter < potionCount) {
      this.potionContents.push(new CompressedInt().read(reader));
      counter++;
    }

    this.vaultUpgradeCost = reader.readShort();
    this.potionUpgradeCost = reader.readShort();
    this.currentPotionMax = reader.readShort();
    this.nextPotionMax = reader.readShort();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.unknownBool);

    writer.writeInt32(this.vaultItemCount);
    writer.writeInt32(this.giftItemCount);
    writer.writeInt32(this.potionItemCount);

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
