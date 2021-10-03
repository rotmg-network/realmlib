import { PacketType } from './packet-type';
import { Packet } from './packet';
/**
 * Creates the correct packet object for the given type.
 * @param type The type of packet to create
 * @throws {Error} if the packet cannot be created
 */
export declare function createPacket(type: PacketType): Packet;
