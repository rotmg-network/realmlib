import { Packet } from "../../packet";
import { PacketType } from "../../packet-type";
import { Reader } from "../../reader";
import { Writer } from "../../writer";
/**
 * Received when the player enters or updates their vault
 */
export declare class VaultContentPacket implements Packet {
    readonly type = PacketType.VAULT_CONTENT;
    /**
     * Unknown
     */
    unknownBool: boolean;
    /**
     * The amount of items in the player vault
     */
    vaultItemCount: number;
    /**
     * The amount of items in the gift vault
     */
    giftItemCount: number;
    /**
     * The amount of items in the potion vault
     */
    potionItemCount: number;
    /**
     * The contents of the players vault, sent as an array of item object IDs or -1 if the slot is empty
     */
    vaultContents: number[];
    /**
     * The contents of the player's gift vault
     */
    giftContents: number[];
    /**
     * The contents of the player's potion vault
     */
    potionContents: number[];
    /**
     * The cost in gold for the next upgrade to the vault
     */
    vaultUpgradeCost: number;
    /**
     * The cost in gold for the next upgrade to the potion vault
     */
    potionUpgradeCost: number;
    /**
     * The current slot size of the player's potion vault
     */
    currentPotionMax: number;
    /**
     * The size of the player's potion vault after they purchase the current upgrade
     */
    nextPotionMax: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
}
