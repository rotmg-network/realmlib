import { ObjectData, ObjectStatusData, StatData } from '.';
import { PlayerData } from '../models';
/**
 * Processes the `data` and returns the resulting `PlayerData` object
 * @param data The data to process.
 */
export declare function processObject(data: ObjectData): PlayerData;
/**
 * Processes the `data` and returns the result. If `currentData` is provided, it will be
 * used as a starting point for the returned `PlayerData`
 * @param data The data to process.
 * @param currentData The existing `PlayerData`
 */
export declare function processObjectStatus(data: ObjectStatusData, currentData?: PlayerData): PlayerData;
/**
 * Process a list of stats and returns the result. If `currentData` is provided, it will be
 * used as a starting point for the returned `PlayerData`
 * @param stats The stats to process
 * @param currentData The existing `PlayerData`
 */
export declare function processStatData(stats: StatData[], currentData?: PlayerData): PlayerData;
