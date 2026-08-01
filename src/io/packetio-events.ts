import { Packet } from '../packet';
import { PacketDirection } from '../packet-registry';
import { PacketType } from '../packet-type';
import { PacketFieldProbe } from '../debug';

export type WirePacketDirection = Exclude<PacketDirection, 'unknown'>;

export interface RawPacket {
  id: number;
  type: PacketType | undefined;
  payload: Buffer;
  size: number;
  /** Direction used to resolve the numeric id in the protocol registry. */
  readonly protocolDirection: WirePacketDirection;
  /** Transport direction relative to this PacketIO instance. */
  readonly direction: 'incoming';
}

export interface RawOutgoingPacket extends Omit<RawPacket, 'direction'> {
  readonly direction: 'outgoing';
}

export interface PacketDiagnostic extends RawPacket {
  status: 'unknown' | 'unimplemented' | 'parsed' | 'parse-error' | 'leftover' | 'opaque';
  offset: number;
  remaining: number;
  probes: PacketFieldProbe[];
  opaqueBytes?: number;
  error?: unknown;
}

export type QueuedOutgoing =
  { kind: 'packet'; packet: Packet } | { kind: 'raw'; id: number; payload: Buffer };

export interface SentPacketEvent {
  id: number;
  type: PacketType;
  size: number;
}

export type OutgoingDroppedEvent =
  { item: QueuedOutgoing; reason: 'queue-full' } | { count: number; reason: 'connection-reset' };

type TypedPacketEvents = {
  [K in PacketType]: [packet: Packet];
};

export type PacketIOEventMap = TypedPacketEvents & {
  error: [error: Error];
  rawPacket: [packet: RawPacket];
  sentRawPacket: [packet: RawOutgoingPacket];
  sentPacket: [packet: SentPacketEvent];
  unknownPacket: [diagnostic: PacketDiagnostic];
  packetDiagnostic: [diagnostic: PacketDiagnostic];
  packetParseError: [diagnostic: PacketDiagnostic];
  packetLeftover: [diagnostic: PacketDiagnostic];
  packetOpaque: [diagnostic: PacketDiagnostic];
  outgoingDropped: [event: OutgoingDroppedEvent];
};
