import { DataPacket } from '../packet';
import { Reader } from '../reader';
import { Writer } from '../writer';

/** One entry returned by `CustomMapListResponsePacket`. */
export class CustomMapData implements DataPacket {
  name: string;
  mapId: number;
  /** Current client field name remains obfuscated. */
  unknownInt: number;
  owned: boolean;

  constructor() {
    this.name = '';
    this.mapId = 0;
    this.unknownInt = 0;
    this.owned = false;
  }

  read(reader: Reader): void {
    this.name = reader.readString();
    this.mapId = reader.readInt32();
    this.unknownInt = reader.readInt32();
    this.owned = reader.readBoolean();
  }

  write(writer: Writer): void {
    writer.writeString(this.name);
    writer.writeInt32(this.mapId);
    writer.writeInt32(this.unknownInt);
    writer.writeBoolean(this.owned);
  }
}
