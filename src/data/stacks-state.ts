import { DataPacket } from '../packet';
import { Reader } from '../reader';
import { Writer } from '../writer';

/**
 * Temporary stat-stack counters serialized by the current client as eight
 * unsigned bytes in base-stat order.
 */
export class StacksState implements DataPacket {
  hp: number;
  mp: number;
  attack: number;
  defense: number;
  speed: number;
  vitality: number;
  wisdom: number;
  dexterity: number;

  constructor() {
    this.hp = 0;
    this.mp = 0;
    this.attack = 0;
    this.defense = 0;
    this.speed = 0;
    this.vitality = 0;
    this.wisdom = 0;
    this.dexterity = 0;
  }

  read(reader: Reader): void {
    this.hp = reader.readUnsignedByte();
    this.mp = reader.readUnsignedByte();
    this.attack = reader.readUnsignedByte();
    this.defense = reader.readUnsignedByte();
    this.speed = reader.readUnsignedByte();
    this.vitality = reader.readUnsignedByte();
    this.wisdom = reader.readUnsignedByte();
    this.dexterity = reader.readUnsignedByte();
  }

  write(writer: Writer): void {
    writer.writeUnsignedByte(this.hp);
    writer.writeUnsignedByte(this.mp);
    writer.writeUnsignedByte(this.attack);
    writer.writeUnsignedByte(this.defense);
    writer.writeUnsignedByte(this.speed);
    writer.writeUnsignedByte(this.vitality);
    writer.writeUnsignedByte(this.wisdom);
    writer.writeUnsignedByte(this.dexterity);
  }
}
