import { expect } from 'chai';
import { Socket } from 'net';
import {
  CheckCreditsPacket,
  Packet,
  PacketIO,
  PacketDiagnostic,
  PacketType,
  RC4,
  RealmlibError,
} from '../src';

function nextTurn(): Promise<void> {
  return new Promise((resolve) => setImmediate(resolve));
}

function socketWithWrites(results: boolean[]): { socket: Socket; writes: Buffer[] } {
  const socket = new Socket();
  const writes: Buffer[] = [];
  socket.write = ((chunk: Uint8Array) => {
    writes.push(Buffer.from(chunk));
    return results.shift() ?? true;
  }) as typeof socket.write;
  return { socket, writes };
}

function emitIncoming(socket: Socket, id: number, payload: Buffer, key: string = '00'): void {
  const frame = Buffer.alloc(payload.length + 5);
  frame.writeInt32BE(frame.length, 0);
  frame.writeUInt8(id, 4);
  payload.copy(frame, 5);
  new RC4(key).cipher(frame.subarray(5));
  socket.emit('data', frame);
}

describe('PacketIO outgoing queue', () => {
  it('serializes sends while the socket is under backpressure', async () => {
    const { socket, writes } = socketWithWrites([false, true, true]);
    const io = new PacketIO({ socket, maxOutgoingQueue: 2 });

    expect(io.send(new CheckCreditsPacket()).status).to.equal('sent');
    expect(io.send(new CheckCreditsPacket()).status).to.equal('queued');
    expect(io.sendRaw(102).status).to.equal('queued');
    expect(writes).to.have.length(1);
    expect(io.outgoingQueueSize).to.equal(2);

    socket.emit('drain');
    await nextTurn();
    await nextTurn();

    expect(writes).to.have.length(3);
    expect(io.outgoingQueueSize).to.equal(0);
  });

  it('rejects packets once the bounded waiting queue is full', () => {
    const { socket } = socketWithWrites([false]);
    const io = new PacketIO({ socket, maxOutgoingQueue: 1 });
    const errors: RealmlibError[] = [];
    io.on('error', (error) => errors.push(error));

    io.send(new CheckCreditsPacket());
    expect(io.send(new CheckCreditsPacket()).accepted).to.equal(true);
    const rejected = io.send(new CheckCreditsPacket());

    expect(rejected).to.deep.include({ accepted: false, status: 'queue-full', queueSize: 1 });
    expect(errors[0].code).to.equal('OUTGOING_QUEUE_FULL');
  });

  it('reports disconnected and missing-mapping sends', () => {
    const disconnected = new PacketIO();
    expect(disconnected.send(new CheckCreditsPacket()).status).to.equal('disconnected');

    const { socket } = socketWithWrites([]);
    const unmapped = new PacketIO({ socket, packetMap: {} });
    expect(unmapped.send(new CheckCreditsPacket()).status).to.equal('missing-mapping');
  });

  it('validates queue configuration', () => {
    expect(() => new PacketIO({ maxOutgoingQueue: 0 }))
      .to.throw(RangeError, 'maxOutgoingQueue must be a positive integer');
  });

  it('retains the packet type in sent events', () => {
    const { socket } = socketWithWrites([true]);
    const io = new PacketIO({ socket });
    let sentType: PacketType | undefined;
    io.on('sentPacket', (event) => {
      sentType = event.type;
    });
    io.send(new CheckCreditsPacket());
    expect(sentType).to.equal(PacketType.CHECKCREDITS);
  });
});

describe('PacketIO diagnostics', () => {
  const directionCases: Array<{
    direction: 'incoming' | 'outgoing';
    id: number;
    payload: string;
    type: PacketType;
  }> = [
    { direction: 'incoming', id: 215, payload: '0000002a01', type: PacketType.PARTY_JOIN_RESULT },
    { direction: 'outgoing', id: 215, payload: '0000002a', type: PacketType.PARTY_JOIN_REQUEST },
    {
      direction: 'incoming',
      id: 217,
      payload: '0001410300010002',
      type: PacketType.PARTY_REQUEST_RESPONSE,
    },
    {
      direction: 'outgoing',
      id: 217,
      payload: '0001410300010002',
      type: PacketType.PARTY_JOIN_REQUEST_RESPONSE,
    },
  ];

  for (const fixture of directionCases) {
    it(`resolves ${fixture.direction} id ${fixture.id} by protocol direction`, () => {
      const { socket } = socketWithWrites([]);
      const io = new PacketIO({
        socket,
        rc4: { incomingKey: '00', outgoingKey: '00' },
        incomingDirection: fixture.direction,
      });
      let packet: Packet | undefined;
      io.on(fixture.type, (event) => {
        packet = event;
      });

      emitIncoming(socket, fixture.id, Buffer.from(fixture.payload, 'hex'));

      expect(packet?.type).to.equal(fixture.type);
    });
  }

  it('labels raw sends with the configured protocol direction', () => {
    const { socket } = socketWithWrites([true]);
    const io = new PacketIO({
      socket,
      rc4: { incomingKey: '00', outgoingKey: '00' },
      outgoingDirection: 'incoming',
    });
    let sentType: PacketType | undefined;
    io.on('sentRawPacket', (event) => {
      sentType = event.type;
    });

    io.sendRaw(215);

    expect(sentType).to.equal(PacketType.PARTY_JOIN_RESULT);
  });

  it('includes payload bytes and field probes for unknown packets', () => {
    const { socket } = socketWithWrites([]);
    const io = new PacketIO({
      socket,
      rc4: { incomingKey: '00', outgoingKey: '00' },
    });
    let diagnostic: PacketDiagnostic | undefined;
    io.on('unknownPacket', (event) => {
      diagnostic = event;
    });

    emitIncoming(socket, 250, Buffer.from('000568656c6c6f', 'hex'));

    expect(diagnostic).to.deep.include({
      id: 250,
      type: undefined,
      status: 'unknown',
      offset: 0,
      remaining: 7,
      direction: 'incoming',
    });
    expect(diagnostic?.payload.toString('hex')).to.equal('000568656c6c6f');
    expect(diagnostic?.probes).to.deep.include({ kind: 'string', bytes: 7, value: 'hello' });
  });

  it('reports parse failures without requiring a typed packet listener', () => {
    const { socket } = socketWithWrites([]);
    const io = new PacketIO({
      socket,
      rc4: { incomingKey: '00', outgoingKey: '00' },
    });
    let diagnostic: PacketDiagnostic | undefined;
    io.on('packetParseError', (event) => {
      diagnostic = event;
    });

    emitIncoming(socket, 170, Buffer.from('0000', 'hex'));

    expect(diagnostic).to.deep.include({
      id: 170,
      type: PacketType.CLAIM_REWARDS_INFO_PROMPT,
      status: 'parse-error',
      offset: 0,
      remaining: 2,
    });
    expect(diagnostic?.error).to.be.instanceOf(Error);
  });

  it('can parse and inspect a mapped packet without a typed listener', () => {
    const { socket } = socketWithWrites([]);
    const io = new PacketIO({
      socket,
      rc4: { incomingKey: '00', outgoingKey: '00' },
    });
    let diagnostic: PacketDiagnostic | undefined;
    io.on('packetDiagnostic', (event) => {
      diagnostic = event;
    });

    emitIncoming(socket, 8, Buffer.from('0000002a', 'hex'));

    expect(diagnostic).to.deep.include({
      id: 8,
      type: PacketType.PING,
      status: 'parsed',
      offset: 4,
      remaining: 0,
    });
  });

  it('reports bytes left unread by a mapped packet parser', () => {
    const { socket } = socketWithWrites([]);
    const io = new PacketIO({
      socket,
      rc4: { incomingKey: '00', outgoingKey: '00' },
    });
    let diagnostic: PacketDiagnostic | undefined;
    io.on('packetLeftover', (event) => {
      diagnostic = event;
    });

    emitIncoming(socket, 8, Buffer.from('0000002aabcd', 'hex'));

    expect(diagnostic).to.deep.include({
      id: 8,
      type: PacketType.PING,
      status: 'leftover',
      offset: 4,
      remaining: 2,
    });
    expect(diagnostic?.probes).to.deep.include({ kind: 'int16', bytes: 2, value: -21555 });
  });
});
