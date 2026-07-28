import { expect } from 'chai';
import { PACKET_REGISTRY, PacketType, Reader, Writer } from '../src';

const defaultWriteExemptions = new Map<PacketType, string>([
  [PacketType.PIC, 'requires positive dimensions and an exact RGBA buffer'],
  [PacketType.FAVOUR_PET, 'requires a category-specific value count'],
]);

describe('registered packet codec contracts', () => {
  for (const definition of PACKET_REGISTRY) {
    if (!definition.factory) {
      continue;
    }

    it(`${definition.type} default write/read is complete and byte-stable`, () => {
      const packet = definition.factory!();
      const reason = defaultWriteExemptions.get(definition.type);
      if (reason) {
        expect(() => packet.write(new Writer()), `${definition.type}: ${reason}`).to.throw();
        return;
      }

      const writer = new Writer();
      packet.write(writer);
      const body = Buffer.from(writer.buffer.subarray(0, writer.index));

      const decoded = definition.factory!();
      const reader = new Reader(body.length);
      body.copy(reader.buffer);
      decoded.read(reader);
      expect(reader.remaining, `${definition.type} did not consume its default body`).to.equal(0);

      const reencoded = new Writer();
      decoded.write(reencoded);
      expect(
        reencoded.buffer.subarray(0, reencoded.index),
        `${definition.type} changed its default body after decoding`,
      ).to.deep.equal(body);
    });
  }

  it('keeps every default-write exemption tied to a registered factory', () => {
    const factoryTypes = new Set(
      PACKET_REGISTRY.filter((definition) => definition.factory).map(
        (definition) => definition.type,
      ),
    );
    for (const type of defaultWriteExemptions.keys()) {
      expect(factoryTypes.has(type), `${type} exemption is stale`).to.equal(true);
    }
  });
});
