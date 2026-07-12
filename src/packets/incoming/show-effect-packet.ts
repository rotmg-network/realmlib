import { WorldPosData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received to tell the player to display an effect such as an AOE grenade
 */
export class ShowEffectPacket implements Packet {

  readonly type = PacketType.SHOWEFFECT;

  /**
   * The type of effect to display
   */
  effectType: number;
  /**
   * The objectId the effect is targeting
   */
  targetObjectId: number;
  /**
   * > Unknown. Probably the start position of the effect
   */
  pos1: WorldPosData;
  /**
   * > Unknown. Probably the end position of the effect
   */
  pos2: WorldPosData;
  /**
   * The color of the effect
   */
  color: number;
  /**
   * The duration of the effect
   */
  duration: number;

  /**
   * The presence bitmask (second byte on the wire). Each bit says whether an
   * optional field follows, so absent fields aren't sent. Preserved here so
   * write() can reproduce exactly what was read:
   * `1`=color, `2`=pos1.x, `4`=pos1.y, `8`=pos2.x, `16`=pos2.y, `32`=duration,
   * `64`=targetObjectId. When building a packet by hand, set the bits for the
   * fields you populate.
   */
  flags: number;

  /** Effect size percentage when flags bit 7 is set; otherwise 100. */
  size: number;

  constructor() {
    this.effectType = 0;
    this.targetObjectId = 0;
    this.pos1 = new WorldPosData();
    this.pos2 = new WorldPosData();
    this.color = 0;
    this.duration = 0;
    this.flags = 0;
    this.size = 100
  }

  read(reader: Reader): void {
    this.effectType = reader.readUnsignedByte();
    const loc2 = reader.readUnsignedByte();
    this.flags = loc2;
    if (loc2 & 64) {
      this.targetObjectId = reader.readCompressedInt();
    } else {
      this.targetObjectId = 0;
    }
    if(loc2 & 2){
      this.pos1.x = reader.readFloat();
    } else {
      this.pos1.x = 0;
    }
    if(loc2 & 4) {
            this.pos1.y = reader.readFloat();
    } else {
      this.pos1.y = 0;
    }
    if(loc2 & 8){
      this.pos2.x = reader.readFloat();
    } else {
      this.pos2.x = 0;
    }
    if(loc2 & 16) {
      this.pos2.y = reader.readFloat();
    } else {
      this.pos2.y = 0;
    }
    if(loc2 & 1) {
      this.color = reader.readInt32();
    } else {
      this.color = 4294967295;
    }
    if(loc2 & 32) {
      this.duration = reader.readFloat();
    } else {
      this.duration = 1;
    }

    this.size = loc2 & 128 ? reader.readByte() : 100;
  }

  write(writer: Writer): void {
    // Mirror read(): a presence bitmask, then only the fields whose bit is set,
    // in the same order. (The previous implementation wrote every field
    // unconditionally and never emitted the bitmask, so a re-encoded packet
    // could not be read back.)
    writer.writeUnsignedByte(this.effectType);
    writer.writeUnsignedByte(this.flags);
    if (this.flags & 64) {
      writer.writeCompressedInt(this.targetObjectId);
    }
    if (this.flags & 2) {
      writer.writeFloat(this.pos1.x);
    }
    if (this.flags & 4) {
      writer.writeFloat(this.pos1.y);
    }
    if (this.flags & 8) {
      writer.writeFloat(this.pos2.x);
    }
    if (this.flags & 16) {
      writer.writeFloat(this.pos2.y);
    }
    if (this.flags & 1) {
      writer.writeInt32(this.color);
    }
    if (this.flags & 32) {
      writer.writeFloat(this.duration);
    }
    if (this.flags & 128) writer.writeByte(this.size);
  }

  toString(): string {
    return `[ShowEffect] Type: ${this.effectType}\n
    TargetObjectId: ${this.targetObjectId}\n
    PosOne: ${this.pos1.toString()}\n
    PosTwo: ${this.pos2.toString()}\n
    Color: ${this.color}\n
    Duration: ${this.duration}`;
  }
}
