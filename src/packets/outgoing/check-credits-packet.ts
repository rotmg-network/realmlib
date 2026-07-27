import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';

/** Requests that the server refresh the player's credits/gold stat. */
export class CheckCreditsPacket implements Packet {

  readonly type = PacketType.CHECKCREDITS;

  //#region packet-specific members

  //#endregion

  write(): void {
    //
  }

  read(): void {
    //
  }
}
