import { WorldPosData } from '../../data/world-pos-data';
import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received when an entity has moved to a new position.
 */
export declare class GotoPacket implements Packet {
    readonly type = PacketType.GOTO;
    /**
     * The object id of the entity which moved.
     */
    objectId: number;
    /**
     * The new position of the entity.
     */
    position: WorldPosData;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
