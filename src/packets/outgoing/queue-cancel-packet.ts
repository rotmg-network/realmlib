import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent when the clients position in the queue should be cancelled
 */
export class QueueCancelPacket implements Packet {
  readonly type = PacketType.QUEUE_CANCEL;

  bufferMax: number;
  bufferSize: number;
  byteString: string;
  bytes: number[];

  constructor() {
    this.bufferMax = 0;
    this.bufferSize = 0;
    this.byteString = '';
    this.bytes = [];
  }

  read(reader: Reader): void {
    this.bufferMax = reader.buffer.byteLength;
    console.log(`[QueueCancel] Buffer max: ${this.bufferMax}`);

    this.bufferSize = reader.buffer.length;
    console.log(`[QueueCancel] Buffer size: ${this.bufferSize}`);

    this.byteString = reader.buffer.toString();
    console.log(`[QueueCancel] To string: ${this.byteString}`);

    console.log(`[QueueCancel] Bytes:`);
    let position = 0;
    let byteString = '';
    while (position < this.bufferSize) {
      let byte = reader.readByte();
      byteString += byte;
      this.bytes.push(byte);

      position++;
    }
    console.log(byteString);
  }

  write(writer: Writer): void {
    console.log(writer.buffer.length); // this is just debug filler
  }
}
