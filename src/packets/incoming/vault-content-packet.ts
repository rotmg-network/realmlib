import { Packet } from "../../packet";
import { PacketType } from "../../packet-type";
import { Reader } from "../../reader";
import { Writer } from "../../writer";

/**
 * Received when the player enters or updates their vault. Item arrays hold
 * item object ids, or -1 for an empty slot. Matches the current build, which
 * includes the material and spoils chests.
 */
export class VaultContentPacket implements Packet {
  readonly type = PacketType.VAULT_CONTENT;

  /** If this is the last vault packet. */
  lastVaultPacket: boolean;
  /** Object id of the main vault chest. */
  chestObjectId: number;
  /** Object id of the material storage. */
  materialObjectId: number;
  /** Object id of the gift chest. */
  giftObjectId: number;
  /** Object id of the potion storage. */
  potionObjectId: number;
  /** Object id of the spoils chest. */
  spoilsObjectId: number;

  /** Contents of the main vault. */
  vaultContents: number[];
  /** Contents of the material storage. */
  materialContents: number[];
  /** Contents of the gift chest. */
  giftContents: number[];
  /** Contents of the potion storage. */
  potionContents: number[];
  /** Contents of the spoils chest. */
  spoilsContents: number[];

  /** Gold cost of the next vault upgrade. */
  vaultUpgradeCost: number;
  /** Gold cost of the next material storage upgrade. */
  materialUpgradeCost: number;
  /** Gold cost of the next potion storage upgrade. */
  potionUpgradeCost: number;
  /** Current potion storage size. */
  currentPotionMax: number;
  /** Potion storage size after the next upgrade. */
  nextPotionMax: number;

  /** Trailing bytes that are not yet understood. */
  unknownBytes: number[];

  constructor() {
    this.lastVaultPacket = false;
    this.chestObjectId = -1;
    this.materialObjectId = -1;
    this.giftObjectId = -1;
    this.potionObjectId = -1;
    this.spoilsObjectId = -1;
    this.vaultContents = [];
    this.materialContents = [];
    this.giftContents = [];
    this.potionContents = [];
    this.spoilsContents = [];
    this.vaultUpgradeCost = -1;
    this.materialUpgradeCost = -1;
    this.potionUpgradeCost = -1;
    this.currentPotionMax = -1;
    this.nextPotionMax = -1;
    this.unknownBytes = [];
  }

  private static readList(reader: Reader): number[] {
    const count = reader.readCompressedInt();
    const list = new Array<number>(count);
    for (let i = 0; i < count; i++) {
      list[i] = reader.readCompressedInt();
    }
    return list;
  }

  private static writeList(writer: Writer, list: number[]): void {
    writer.writeCompressedInt(list.length);
    for (const item of list) {
      writer.writeCompressedInt(item);
    }
  }

  read(reader: Reader): void {
    this.lastVaultPacket = reader.readBoolean();
    this.chestObjectId = reader.readCompressedInt();
    this.materialObjectId = reader.readCompressedInt();
    this.giftObjectId = reader.readCompressedInt();
    this.potionObjectId = reader.readCompressedInt();
    this.spoilsObjectId = reader.readCompressedInt();

    this.vaultContents = VaultContentPacket.readList(reader);
    this.materialContents = VaultContentPacket.readList(reader);
    this.giftContents = VaultContentPacket.readList(reader);
    this.potionContents = VaultContentPacket.readList(reader);
    this.spoilsContents = VaultContentPacket.readList(reader);

    this.vaultUpgradeCost = reader.readShort();
    this.materialUpgradeCost = reader.readShort();
    this.potionUpgradeCost = reader.readShort();
    this.currentPotionMax = reader.readShort();
    this.nextPotionMax = reader.readShort();

    this.unknownBytes = [];
    while (reader.remaining > 0) {
      this.unknownBytes.push(reader.readByte());
    }
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.lastVaultPacket);
    writer.writeCompressedInt(this.chestObjectId);
    writer.writeCompressedInt(this.materialObjectId);
    writer.writeCompressedInt(this.giftObjectId);
    writer.writeCompressedInt(this.potionObjectId);
    writer.writeCompressedInt(this.spoilsObjectId);

    VaultContentPacket.writeList(writer, this.vaultContents);
    VaultContentPacket.writeList(writer, this.materialContents);
    VaultContentPacket.writeList(writer, this.giftContents);
    VaultContentPacket.writeList(writer, this.potionContents);
    VaultContentPacket.writeList(writer, this.spoilsContents);

    writer.writeShort(this.vaultUpgradeCost);
    writer.writeShort(this.materialUpgradeCost);
    writer.writeShort(this.potionUpgradeCost);
    writer.writeShort(this.currentPotionMax);
    writer.writeShort(this.nextPotionMax);

    for (const byte of this.unknownBytes) {
      writer.writeByte(byte);
    }
  }
}
