/** Lifecycle states for an account or inventory mutation. */
export enum MutationState {
  Pending = 'pending',
  Confirmed = 'confirmed',
  Failed = 'failed',
  /** The request may have committed, but its authoritative result is unavailable. */
  Unknown = 'unknown',
}

/** Immutable public view of one tracked mutation. */
export interface MutationRecord {
  readonly id: number;
  readonly operationKey: string;
  readonly resourceKeys: readonly string[];
  readonly state: MutationState;
}

/** Result of trying to begin a mutation. */
export interface MutationBeginResult {
  readonly accepted: boolean;
  /** The new record, or the active record which caused suppression. */
  readonly record: MutationRecord;
}

interface MutableMutationRecord {
  id: number;
  operationKey: string;
  resourceKeys: string[];
  state: MutationState;
}

/**
 * Opt-in coordinator for mutation safety at the consumer boundary.
 *
 * RealmLib packets do not carry a universal transaction id. This coordinator
 * therefore never guesses request/result correlation and never sends, retries,
 * or replays a packet. Consumers supply stable operation/resource keys, retain
 * the returned local id, and resolve it only after a direct result plus any
 * required authoritative state refresh.
 *
 * `pending` and `unknown` records hold their resources. A reconnect should call
 * {@link MutationCoordinator.markAllPendingUnknown}; an unknown record must be
 * reconciled to `confirmed` or `failed` before another mutation can acquire the
 * same operation or resource.
 */
export class MutationCoordinator {
  private nextId = 1;
  private readonly records = new Map<number, MutableMutationRecord>();
  private readonly activeOperations = new Map<string, number>();
  private readonly activeResources = new Map<string, number>();

  /**
   * Starts one mutation or returns the conflicting active mutation.
   * Duplicate resource keys are coalesced locally.
   */
  begin(operationKey: string, resourceKeys: Iterable<string> = []): MutationBeginResult {
    assertKey(operationKey, 'operation');
    const resources = [...new Set(resourceKeys)];
    for (const resourceKey of resources) {
      assertKey(resourceKey, 'resource');
    }

    const operationConflict = this.activeOperations.get(operationKey);
    if (operationConflict !== undefined) {
      return Object.freeze({ accepted: false, record: this.snapshot(operationConflict)! });
    }
    for (const resourceKey of resources) {
      const resourceConflict = this.activeResources.get(resourceKey);
      if (resourceConflict !== undefined) {
        return Object.freeze({ accepted: false, record: this.snapshot(resourceConflict)! });
      }
    }

    const record: MutableMutationRecord = {
      id: this.nextId++,
      operationKey,
      resourceKeys: resources,
      state: MutationState.Pending,
    };
    this.records.set(record.id, record);
    this.activeOperations.set(operationKey, record.id);
    for (const resourceKey of resources) {
      this.activeResources.set(resourceKey, record.id);
    }
    return Object.freeze({ accepted: true, record: toSnapshot(record) });
  }

  /** Returns an immutable snapshot, if the local mutation id is known. */
  get(id: number): MutationRecord | undefined {
    assertId(id);
    return this.snapshot(id);
  }

  /** Returns immutable snapshots in monotonically increasing local-id order. */
  list(): readonly MutationRecord[] {
    return Object.freeze([...this.records.values()].map(toSnapshot));
  }

  /** Marks a pending request ambiguous without releasing its resources. */
  markUnknown(id: number): boolean {
    const record = this.record(id);
    if (!record || record.state !== MutationState.Pending) {
      return false;
    }
    record.state = MutationState.Unknown;
    return true;
  }

  /** Marks every pending request ambiguous, for example after reconnect. */
  markAllPendingUnknown(): number {
    let changed = 0;
    for (const record of this.records.values()) {
      if (record.state === MutationState.Pending) {
        record.state = MutationState.Unknown;
        changed++;
      }
    }
    return changed;
  }

  /**
   * Applies an authoritative terminal outcome and releases held resources.
   * Returns false for an unknown local id or a late/duplicate terminal result.
   */
  resolve(id: number, state: MutationState.Confirmed | MutationState.Failed): boolean {
    if (state !== MutationState.Confirmed && state !== MutationState.Failed) {
      throw new TypeError('mutation outcome must be confirmed or failed');
    }
    const record = this.record(id);
    if (!record || !isActive(record.state)) {
      return false;
    }

    record.state = state;
    this.release(record);
    return true;
  }

  /** Removes a terminal record. Active and ambiguous records cannot be forgotten. */
  forget(id: number): boolean {
    const record = this.record(id);
    if (!record || isActive(record.state)) {
      return false;
    }
    return this.records.delete(id);
  }

  /** Removes all terminal history while retaining pending and unknown records. */
  clearResolved(): number {
    let removed = 0;
    for (const [id, record] of this.records) {
      if (!isActive(record.state)) {
        this.records.delete(id);
        removed++;
      }
    }
    return removed;
  }

  private record(id: number): MutableMutationRecord | undefined {
    assertId(id);
    return this.records.get(id);
  }

  private snapshot(id: number): MutationRecord | undefined {
    const record = this.records.get(id);
    return record ? toSnapshot(record) : undefined;
  }

  private release(record: MutableMutationRecord): void {
    if (this.activeOperations.get(record.operationKey) === record.id) {
      this.activeOperations.delete(record.operationKey);
    }
    for (const resourceKey of record.resourceKeys) {
      if (this.activeResources.get(resourceKey) === record.id) {
        this.activeResources.delete(resourceKey);
      }
    }
  }
}

/** Options for bounded refresh-only exponential backoff. */
export interface RefreshBackoffOptions {
  readonly baseDelayMs?: number;
  readonly maximumDelayMs?: number;
  /** Downward jitter ratio in [0, 1]. `0.2` yields 80%-100% of the exponential delay. */
  readonly jitterRatio?: number;
  /** Injectable source in [0, 1] for deterministic tests. Defaults to `Math.random`. */
  readonly random?: () => number;
}

/**
 * Calculates bounded exponential backoff with downward jitter for authoritative
 * state refreshes. It is intentionally not an automatic mutation-retry helper.
 */
export function refreshBackoffDelayMs(
  attempt: number,
  options: RefreshBackoffOptions = {},
): number {
  if (!Number.isInteger(attempt) || attempt < 0) {
    throw new RangeError('refresh attempt must be a non-negative integer');
  }
  const baseDelayMs = options.baseDelayMs ?? 250;
  const maximumDelayMs = options.maximumDelayMs ?? 30_000;
  const jitterRatio = options.jitterRatio ?? 0.2;
  assertPositiveFinite(baseDelayMs, 'base delay');
  assertPositiveFinite(maximumDelayMs, 'maximum delay');
  if (maximumDelayMs < baseDelayMs) {
    throw new RangeError('maximum delay must be greater than or equal to base delay');
  }
  if (!Number.isFinite(jitterRatio) || jitterRatio < 0 || jitterRatio > 1) {
    throw new RangeError('jitter ratio must be in [0, 1]');
  }

  const random = (options.random ?? Math.random)();
  if (!Number.isFinite(random) || random < 0 || random > 1) {
    throw new RangeError('random source must return a finite value in [0, 1]');
  }
  const exponential = Math.min(maximumDelayMs, baseDelayMs * 2 ** Math.min(attempt, 52));
  return Math.round(exponential * (1 - jitterRatio * (1 - random)));
}

function isActive(state: MutationState): boolean {
  return state === MutationState.Pending || state === MutationState.Unknown;
}

function toSnapshot(record: MutableMutationRecord): MutationRecord {
  return Object.freeze({
    id: record.id,
    operationKey: record.operationKey,
    resourceKeys: Object.freeze([...record.resourceKeys]),
    state: record.state,
  });
}

function assertKey(value: string, label: string): void {
  if (typeof value !== 'string' || value.length === 0) {
    throw new TypeError(`${label} key must be a non-empty string`);
  }
}

function assertId(id: number): void {
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new RangeError('mutation id must be a positive safe integer');
  }
}

function assertPositiveFinite(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a positive finite number`);
  }
}
