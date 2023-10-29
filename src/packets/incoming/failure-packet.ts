import { FailureCode } from '../../models';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received when an error has occurred
 */
export class FailurePacket implements Packet {

  readonly type = PacketType.FAILURE;

  /**
   * The error ID code of the failure
   */
  errorId: number;
  /**
   * A description of the error
   */
  errorDescription: string;

  constructor() {
    this.errorId = 0;
    this.errorDescription = '';
  }

  read(reader: Reader): void {
    this.errorId = reader.readInt32();
    this.errorDescription = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeInt32(this.errorId);
    writer.writeString(this.errorDescription);
  }

  toString(): string {
    return `[Failure - 0] Id: ${this.errorId} - Description: ${this.errorDescription}`;
  }
}
