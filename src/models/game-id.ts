/**
 * Known map ids accepted in the Hello packet. Negative ids are special maps;
 * realm instances and portal reconnects use server-assigned ids.
 */
export enum GameId {
  Tutorial = -1,
  Nexus = -2,
  RandomRealm = -3,
  NexusTutorial = -4,
  Vault = -5,
  MapTest = -6,
  VaultExplanation = -8,
  NexusExplanation = -9,
  QuestRoom = -11,
  CheatersQuarantine = -13,
}

/**
 * Backwards-compatible aliases for older client code.
 */
export const GAME_ID = {
  NEXUS: GameId.Nexus,
  NEXUS_EXPLANATION: GameId.NexusExplanation,
  NEXUS_TUTORIAL: GameId.NexusTutorial,
  TUTORIAL: GameId.Tutorial,
  QUEST_ROOM: GameId.QuestRoom,
  VAULT: GameId.Vault,
  VAULT_EXPLANATION: GameId.VaultExplanation,
};