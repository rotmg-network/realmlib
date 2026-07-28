import { PacketMap, ReadonlyPacketMap } from '../packet-map';
import { getPacketDefinitionById } from '../packet-registry';
import { PacketType } from '../packet-type';
import { WirePacketDirection } from './packetio-events';

/** Resolves packet ids without flattening direction-scoped registry entries. */
export class PacketResolver {
  constructor(
    private readonly packetMap: ReadonlyPacketMap,
    private readonly canonicalMap: ReadonlyPacketMap,
  ) {}

  idFor(type: PacketType): number | undefined {
    const value = this.packetMap[type];
    return typeof value === 'number' ? value : undefined;
  }

  typeFor(id: number, direction: WirePacketDirection): PacketType | undefined {
    if (this.packetMap === this.canonicalMap) {
      return getPacketDefinitionById(id, direction)?.type;
    }
    const mapped = this.packetMap[id];
    return typeof mapped === 'string' ? mapped as PacketType : undefined;
  }
}

/** Creates a resolver over an owned mutable custom map. */
export function createPacketResolver(packetMap: PacketMap, canonicalMap: ReadonlyPacketMap): PacketResolver {
  return new PacketResolver(packetMap, canonicalMap);
}
