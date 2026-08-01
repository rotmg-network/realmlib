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

  /** Selects a pet as active, or clears the active pet when `instanceId` is zero. */
  static setActive(instanceId: number): ActivePetUpdateRequestPacket {
    const packet = new ActivePetUpdateRequestPacket();
    packet.commandType = ActivePetUpdateType.SetActive;
    packet.instanceId = instanceId;
    return packet;
  }

  /** Clears the currently active/following pet. */
  static clearActive(): ActivePetUpdateRequestPacket {
    return ActivePetUpdateRequestPacket.setActive(0);
  }

  /** Releases the supplied pet instance. */
  static release(instanceId: number): ActivePetUpdateRequestPacket {
    const packet = new ActivePetUpdateRequestPacket();
    packet.commandType = ActivePetUpdateType.Release;
    packet.instanceId = instanceId;
    return packet;
  }

  write(writer: Writer): void {
    writer.writeUnsignedByte(this.commandType);
    writer.writeInt32(this.instanceId);
  }

  read(reader: Reader): void {
    this.commandType = reader.readUnsignedByte();
    this.instanceId = reader.readInt32();
  }

  typeToName(command: number): string {
    switch (command) {
      case ActivePetUpdateType.SetActive:
        return `${command} : SetActive`;
      case ActivePetUpdateType.Release:
        return `${command} : Release`;
      case ActivePetUpdateType.LegacyUnobserved:
        return `${command} : LegacyUnobserved`;
      default:
        return `${command} : Unknown`;
    }
  }

  toString(): string {
    return `[ActivePetUpdateRequest - 24] CommandType: ${this.typeToName(this.commandType)} - InstanceId: ${this.instanceId}`;
  }
}
