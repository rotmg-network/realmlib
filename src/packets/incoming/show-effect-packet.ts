import { WorldPosData } from '../../data/world-pos-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
import { read as compressedRead } from '../../data/compressed-int';

/**
 * Received to tell the player to display an effect such as an AOE grenade.
 */
export class ShowEffectPacket implements Packet {

  readonly type = PacketType.SHOWEFFECT;

  //#region packet-specific members
  /**
   * The type of effect to display.
   */
  effectType: number;
  /**
   * > Unknown. Probably the start position of the effect.
   */
  targetObjectId: number;
  /**
   * > Unknown. Probably the end position of the effect.
   */
  pos1: WorldPosData;
  /**
   * > Unknown.
   */
  pos2: WorldPosData;
  /**
   * The color of the effect.
   */
  color: number;
  /**
   * The duration of the effect.
   */
  duration: number;
  //#endregion

  constructor() {
    this.effectType = 0;
    this.targetObjectId = 0;
    this.pos1 = new WorldPosData();
    this.pos2 = new WorldPosData();
    this.color = 0;
    this.duration = 0;
  }

  read(reader: Reader): void {
    this.effectType = reader.readUnsignedByte();
    let loc2 = reader.readUnsignedByte();
    if (loc2 & 64) {
      this.targetObjectId = compressedRead(reader);
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
  }

  write(writer: Writer): void {
    writer.writeUnsignedByte(this.effectType);
    writer.writeInt32(this.targetObjectId);
    this.pos1.write(writer);
    this.pos2.write(writer);
    writer.writeInt32(this.color);
    writer.writeFloat(this.duration);
  }
}
