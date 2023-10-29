import { Packet } from "../../packet";
import { PacketType } from "../../packet-type";
import { Reader } from "../../reader";
import { CompressedInt } from '../../data';
import { Writer } from "../../writer";

/**
 * Received when the player enters or updates their vault
 */
export class VaultContentPacket implements Packet {
  readonly type = PacketType.VAULT_CONTENT;
  /**
   * Unknown
   */
  unknownBool: boolean;
  /**
   * Object id of the main vault chest
   */
  chestObjectId: number;
  /**
   * object Id of the gift chest
   */
  giftObjectId: number;
  /**
   * Object Id of the Potion Storage
   */
  potionObjectId: number;
  /**
   * Sometype of info?
   */
  info: number;
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
  /**
   * unkown ass bytes
   */
  unknownBytes: number[];

  constructor() {
    this.unknownBool = false;
    this.chestObjectId = -1;
    this.giftObjectId = -1;
    this.potionObjectId = -1;
    this.info = -1;
    this.vaultContents = [];
    this.giftContents = [];
    this.potionContents = [];
    this.vaultUpgradeCost = 0;
    this.potionUpgradeCost = 0;
    this.currentPotionMax = 0;
    this.nextPotionMax = 0;
    this.unknownBytes = [];
  }

  read(reader: Reader): void {
    this.unknownBool = reader.readBoolean();
    this.chestObjectId = reader.readCompressedInt();
    this.giftObjectId = reader.readCompressedInt();
    this.potionObjectId = reader.readCompressedInt();

    let vaultCount = reader.readCompressedInt();
      for (let i = 0; i < vaultCount; i++) {
        this.vaultContents.push(reader.readCompressedInt());
      }

    let giftCount = reader.readCompressedInt();
    for (let i = 0; i < giftCount; i++) {
      this.giftContents.push(reader.readCompressedInt());
    }

    let potionCount = reader.readCompressedInt();
    for (let i = 0; i < potionCount; i++) {
      this.potionContents.push(reader.readCompressedInt());
    }

    this.vaultUpgradeCost = reader.readShort();
    this.potionUpgradeCost = reader.readShort();
    this.currentPotionMax = reader.readShort();
    this.nextPotionMax = reader.readShort();

    for (let i = 0; i < reader.remaining; i++){
      this.unknownBytes.push(reader.readByte());
    }
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.unknownBool);

    writer.writeCompressedInt(this.chestObjectId);
    writer.writeCompressedInt(this.giftObjectId);
    writer.writeCompressedInt(this.potionObjectId);
    writer.writeCompressedInt(this.info)

    writer.writeCompressedInt(this.vaultContents.length);
    for (const item of this.vaultContents) {
      writer.writeCompressedInt(item);
    }
    writer.writeCompressedInt(this.giftContents.length);
    for (const item of this.giftContents) {
      writer.writeCompressedInt(item);
    }
    writer.writeCompressedInt(this.potionContents.length);
    for (const item of this.potionContents) {
      writer.writeCompressedInt(item);
    }
    writer.writeShort(this.vaultUpgradeCost);
    writer.writeShort(this.potionUpgradeCost);
    writer.writeShort(this.currentPotionMax);
    writer.writeShort(this.nextPotionMax);

    for (let i = 0; i < this.unknownBytes.length; i++){
      writer.writeByte(this.unknownBytes[i]);
    }
  }
}
