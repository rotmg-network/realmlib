import { ActivePetUpdateType } from '../../../models';
import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';

/**
 * Sent to make an update to the pet currently following the player
 */
export class ActivePetUpdateRequestPacket implements Packet {

  readonly type = PacketType.ACTIVE_PET_UPDATE_REQUEST;

  /**
   * The type of update to perform
   */
  commandType: ActivePetUpdateType;
  /**
   * The instance id of the pet to update
   */
  instanceId: number;

  constructor() {
    this.commandType = 0;
    this.instanceId = 0;
  }

  write(writer: Writer): void {
    writer.writeByte(this.commandType);
    writer.writeInt32(this.instanceId);
  }

  read(reader: Reader): void {
    this.commandType = reader.readByte();
    this.instanceId = reader.readInt32();
  }

  typeToName(command: number): string {
    switch(command) {
      case ActivePetUpdateType.Follow:
        return `${command} : Follow`;
      case ActivePetUpdateType.Release:
        return `${command} : Release`;
      case ActivePetUpdateType.Unfollow:
        return `${command} : Unfollow`;
      default:
        return `${command} : Unknown`;
    }
  }

  toString(): string {
    return `[ActivePetUpdateRequest - 24] CommandType: ${this.typeToName(this.commandType)} - InstanceId: ${this.instanceId}`;
  }
}
