import { Packet } from './packet';
import { getPacketDefinition } from './packet-registry';
import { PacketType } from './packet-type';

/**
 * Creates the packet object registered for `type`.
 * @throws {Error} when the packet is known but its wire structure is not yet implemented.
 */
export function createPacket(type: PacketType): Packet {
  if (typeof type !== 'string') {
    throw new TypeError(`Parameter "type" must be a string, not ${typeof type}`);
  }
  const definition = getPacketDefinition(type);
  if (!definition?.factory) {
    throw new Error(`Unknown or unimplemented packet type: ${type}`);
  }
  return definition.factory();
}
