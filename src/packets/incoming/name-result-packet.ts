import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Received in response to a `ChooseNamePacket`
 */
export class NameResultPacket implements Packet {

  readonly type = PacketType.NAMERESULT;

  /**
   * Whether or not the name change was successful
   */
  success: boolean;
  /**
   * The error which occurred, if the result was not successful
   */
  errorText: string;

  constructor() {
    this.success = false;
    this.errorText = '';
  }

  read(reader: Reader): void {
    this.success = reader.readBoolean();
    this.errorText = reader.readString();
  }

  write(writer: Writer): void {
    writer.writeBoolean(this.success);
    writer.writeString(this.errorText);
  }

  toString(): string {
    return `[NameResult] Success: ${this.success}\n
    ErrorText: ${this.errorText}`;
  }
}
