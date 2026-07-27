import { PACKET_REGISTRY } from './packet-registry';
import { PacketType } from './packet-type';

/**
 * A bidirectional map between packet types and numeric ids.
 */
export interface PacketMap {
  /** Numeric id -> packet type. */
  [id: number]: PacketType | undefined;
  /** Packet type -> numeric id. */
  [type: string]: number | PacketType | undefined;
}

/**
 * Default bidirectional packet map, derived from the central packet registry.
 */
export const DEFAULT_PACKET_MAP: PacketMap = {};
for (const definition of PACKET_REGISTRY) {
  if (definition.id === undefined) {
    continue;
  }
  DEFAULT_PACKET_MAP[definition.id] = definition.type;
  DEFAULT_PACKET_MAP[definition.type] = definition.id;
}
