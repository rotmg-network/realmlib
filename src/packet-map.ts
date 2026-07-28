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

/** Read-only view used by canonical maps and PacketIO instances. */
export type ReadonlyPacketMap = Readonly<PacketMap>;

/**
 * Default bidirectional packet map, derived from the central packet registry.
 */
const defaultPacketMap: PacketMap = {};
for (const definition of PACKET_REGISTRY) {
  if (definition.id === undefined || definition.id < 0 || definition.id > 255) {
    continue;
  }
  defaultPacketMap[definition.type] = definition.id;
  // Numeric lookups are used for packets received by a normal game client.
  // Preserve an outgoing-only entry for compatibility, but always let an
  // incoming definition win when an id is reused in both directions.
  if (defaultPacketMap[definition.id] === undefined || definition.direction === 'incoming') {
    defaultPacketMap[definition.id] = definition.type;
  }
}

/** Immutable canonical map. Use {@link createPacketMap} for customization. */
export const DEFAULT_PACKET_MAP: ReadonlyPacketMap = Object.freeze(defaultPacketMap);

/** Creates an owned mutable packet map, optionally initialized from a source. */
export function createPacketMap(source: ReadonlyPacketMap = DEFAULT_PACKET_MAP): PacketMap {
  return { ...source };
}
