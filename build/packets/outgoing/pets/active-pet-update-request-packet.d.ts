import { ActivePetUpdateType } from '../../../models';
import { Packet } from '../../../packet';
import { PacketType } from '../../../packet-type';
import { Reader } from '../../../reader';
import { Writer } from '../../../writer';
/**
 * Sent to make an update to the pet currently following the player
 */
export declare class ActivePetUpdateRequestPacket implements Packet {
    readonly type = PacketType.ACTIVE_PET_UPDATE_REQUEST;
    /**
     * The type of update to perform
     */
    commandType: ActivePetUpdateType;
    /**
     * The instance id of the pet to update
     */
    instanceId: number;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
    typeToName(command: number): string;
    toString(): string;
}
