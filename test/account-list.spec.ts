import { expect } from 'chai';
import { AccountListType, EditAccountListPacket } from '../src';
import { expectRoundTripsTo, parseHex } from './support/codec';

describe('EditAccountListPacket (editaccountlist log)', () => {
  it('parses a captured "lock add" (listId 0, add true)', () => {
    // #831: lock-add player object 241011 (0x3ad73).
    const p = parseHex(new EditAccountListPacket(), '00000000010003ad73');
    expect(p.accountListId).to.equal(AccountListType.Lock);
    expect(p.add).to.equal(true);
    expect(p.objectId).to.equal(241011);
    expectRoundTripsTo(p, '00000000010003ad73');
  });

  it('parses a captured "ignore add" (listId 1, add true)', () => {
    // #1222: ignore-add player object 241847 (0x3b0b7).
    const p = parseHex(new EditAccountListPacket(), '00000001010003b0b7');
    expect(p.accountListId).to.equal(AccountListType.Ignore);
    expect(p.add).to.equal(true);
    expect(p.objectId).to.equal(241847);
    expectRoundTripsTo(p, '00000001010003b0b7');
  });

  it('parses a captured "lock remove" (listId 0, add false)', () => {
    // #990: lock-remove player object 241011.
    const p = parseHex(new EditAccountListPacket(), '00000000000003ad73');
    expect(p.accountListId).to.equal(AccountListType.Lock);
    expect(p.add).to.equal(false);
    expect(p.objectId).to.equal(241011);
    expectRoundTripsTo(p, '00000000000003ad73');
  });
});
