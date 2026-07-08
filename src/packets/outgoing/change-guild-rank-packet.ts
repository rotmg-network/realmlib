import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';

/**
 * Sent to change the guild rank of a member in the player's guild.
 */
export class ChangeGuildRankPacket implements Packet {

  readonly type = PacketType.CHANGEGUILDRANK;

  //#region packet-specific members
  /**
   * The name of the player whose rank will change.
   */
  name: string;
  /**
   * The new rank of the player. A single byte in the current build (guild rank
   * tiers such as 0 = initiate, 10 = member); previously read as an int32,
   * which overran the packet.
   */
  guildRank: number;
  //#endregion

  constructor() {
    this.name = '';
    this.guildRank = 0;
  }

  write(writer: Writer): void {
    writer.writeString(this.name);
    writer.writeByte(this.guildRank);
  }

  read(reader: Reader): void {
    this.name = reader.readString();
    this.guildRank = reader.readByte();
  }
}
