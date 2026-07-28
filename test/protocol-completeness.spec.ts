import { expect } from 'chai';
import { PacketType, protocolCompleteness, protocolSupportKind } from '../src';

/* eslint-disable @typescript-eslint/no-require-imports -- CommonJS documentation generator */
const currentProtocol: {
  exalt_version: string;
  unmapped_incoming: string[];
  unmapped_outgoing: string[];
} = require('../protocol/exalt-current.json');
const {
  generateProtocolCompleteness,
}: {
  generateProtocolCompleteness(catalog: typeof currentProtocol): string;
} = require('../scripts/generate-protocol-completeness.cjs');

describe('protocol completeness taxonomy', () => {
  it('separates modeled, raw, research, legacy, and id-less definitions', () => {
    const groups = protocolCompleteness();
    expect(groups['raw-wire'].map((entry) => entry.type)).to.deep.equal([
      PacketType.ACCELERATOR_ADDED,
    ]);
    expect(groups['research-candidate'].map((entry) => entry.type)).to.include(
      PacketType.UPGRADE_ENCHANTMENT,
    );
    expect(groups['legacy-metadata'][0].type).to.equal(PacketType.IP_ADDRESS);
    expect(groups['modeled-transport'].map((entry) => entry.type)).to.have.members([
      PacketType.CHATTOKEN,
      PacketType.CHATHELLO,
    ]);
    for (const definition of groups['modeled-wire']) {
      expect(protocolSupportKind(definition)).to.equal('modeled-wire');
    }
  });

  it('generates an evidence-conservative Markdown report', () => {
    const markdown = generateProtocolCompleteness(currentProtocol);
    expect(markdown).to.include('| Modeled wire packets | 202 |');
    expect(markdown).not.to.include('`incoming:218` — `FOR_RECONNECT`');
    expect(markdown).to.include('Catalog nested/helper classes');
    expect(markdown).to.include('Not presumed');
  });
});
