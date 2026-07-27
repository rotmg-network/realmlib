import { expect } from 'chai';
import { Socket } from 'net';
import {
  CheckCreditsPacket,
  PacketIO,
  PacketType,
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
