import { expect } from 'chai';
import { MutationCoordinator, MutationState, refreshBackoffDelayMs, SlotObjectData } from '../src';

describe('MutationCoordinator', () => {
  it('suppresses duplicate operations and overlapping resources', () => {
    const coordinator = new MutationCoordinator();
    const slot = SlotObjectData.from(100, 12, 0x9588);
    const first = coordinator.begin('forge:blueprint:42', [slot.locationKey(), slot.locationKey()]);

    expect(first.accepted).to.equal(true);
    expect(first.record.resourceKeys).to.deep.equal(['slot:100:12']);

    const duplicate = coordinator.begin('forge:blueprint:42', ['slot:999:1']);
    expect(duplicate.accepted).to.equal(false);
    expect(duplicate.record.id).to.equal(first.record.id);

    const overlapping = coordinator.begin('inventory:swap', [slot.locationKey()]);
    expect(overlapping.accepted).to.equal(false);
    expect(overlapping.record.id).to.equal(first.record.id);
    expect(coordinator.list()).to.have.length(1);
  });

  it('holds ambiguous resources across reconnect until authoritative reconciliation', () => {
    const coordinator = new MutationCoordinator();
    const pending = coordinator.begin('claim:reward:50', ['account:rewards']);

    expect(coordinator.markAllPendingUnknown()).to.equal(1);
    expect(coordinator.get(pending.record.id)?.state).to.equal(MutationState.Unknown);
    expect(coordinator.markAllPendingUnknown()).to.equal(0);

    const replay = coordinator.begin('claim:reward:50', ['account:rewards']);
    expect(replay.accepted).to.equal(false);
    expect(replay.record.state).to.equal(MutationState.Unknown);

    expect(coordinator.resolve(pending.record.id, MutationState.Confirmed)).to.equal(true);
    expect(coordinator.begin('claim:reward:50', ['account:rewards']).accepted).to.equal(true);
  });

  it('rejects late terminal results without changing a newer generation', () => {
    const coordinator = new MutationCoordinator();
    const first = coordinator.begin('account-list:0', ['account-list:0']);
    expect(coordinator.resolve(first.record.id, MutationState.Confirmed)).to.equal(true);

    const second = coordinator.begin('account-list:0', ['account-list:0']);
    expect(second.record.id).to.be.greaterThan(first.record.id);
    expect(coordinator.resolve(first.record.id, MutationState.Failed)).to.equal(false);
    expect(coordinator.get(second.record.id)?.state).to.equal(MutationState.Pending);
  });

  it('retains active records while allowing terminal history cleanup', () => {
    const coordinator = new MutationCoordinator();
    const confirmed = coordinator.begin('purchase:item:1');
    const unknown = coordinator.begin('gift:recipient:synthetic');
    coordinator.resolve(confirmed.record.id, MutationState.Confirmed);
    coordinator.markUnknown(unknown.record.id);

    expect(coordinator.forget(unknown.record.id)).to.equal(false);
    expect(coordinator.clearResolved()).to.equal(1);
    expect(coordinator.list()).to.deep.equal([
      {
        id: unknown.record.id,
        operationKey: 'gift:recipient:synthetic',
        resourceKeys: [],
        state: MutationState.Unknown,
      },
    ]);
  });

  it('validates caller-supplied keys, ids, and terminal states', () => {
    const coordinator = new MutationCoordinator();
    expect(() => coordinator.begin('')).to.throw(TypeError);
    expect(() => coordinator.begin('claim', [''])).to.throw(TypeError);
    expect(() => coordinator.get(0)).to.throw(RangeError);
    const pending = coordinator.begin('claim');
    expect(() =>
      coordinator.resolve(pending.record.id, MutationState.Pending as MutationState.Confirmed),
    ).to.throw(TypeError);
  });
});

describe('refreshBackoffDelayMs', () => {
  it('uses bounded exponential delay with injectable downward jitter', () => {
    const low = refreshBackoffDelayMs(0, {
      baseDelayMs: 100,
      maximumDelayMs: 800,
      jitterRatio: 0.2,
      random: () => 0,
    });
    const high = refreshBackoffDelayMs(0, {
      baseDelayMs: 100,
      maximumDelayMs: 800,
      jitterRatio: 0.2,
      random: () => 1,
    });
    const capped = refreshBackoffDelayMs(50, {
      baseDelayMs: 100,
      maximumDelayMs: 800,
      jitterRatio: 0,
    });

    expect(low).to.equal(80);
    expect(high).to.equal(100);
    expect(capped).to.equal(800);
  });

  it('rejects invalid configuration and random sources', () => {
    expect(() => refreshBackoffDelayMs(-1)).to.throw(RangeError);
    expect(() => refreshBackoffDelayMs(0, { baseDelayMs: 0 })).to.throw(RangeError);
    expect(() => refreshBackoffDelayMs(0, { baseDelayMs: 2, maximumDelayMs: 1 })).to.throw(
      RangeError,
    );
    expect(() => refreshBackoffDelayMs(0, { jitterRatio: 2 })).to.throw(RangeError);
    expect(() => refreshBackoffDelayMs(0, { random: () => Number.NaN })).to.throw(RangeError);
  });
});
