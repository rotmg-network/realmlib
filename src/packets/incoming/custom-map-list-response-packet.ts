import { CustomMapData } from '../../data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/** Returns all custom maps available to the account. */
export class CustomMapListResponsePacket implements Packet {
  readonly type = PacketType.CUSTOM_MAP_LIST_RESPONSE;

  maps: CustomMapData[];

  constructor() {
    this.maps = [];
  }

  read(reader: Reader): void {
    const count = reader.validateCollectionCount(reader.readInt32(), 11, 'custom maps');
    this.maps = new Array(count);
    for (let i = 0; i < count; i++) {
      const map = new CustomMapData();
      map.read(reader);
      this.maps[i] = map;
    }
  }

  write(writer: Writer): void {
    writer.writeInt32(this.maps.length);
    for (const map of this.maps) {
      map.write(writer);
    }
  }
}
