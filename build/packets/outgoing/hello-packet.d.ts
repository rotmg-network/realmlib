import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Sent to prompt the server to accept the connection of an account
 * and reply with a `MapInfoPacket`.
 */
export declare class HelloPacket implements Packet {
    readonly type = PacketType.HELLO;
    /**
     * The current build version of RotMG.
     */
    buildVersion: string;
    /**
     * The id of the map to connect to.
     */
    gameId: number;
    /**
     * The access token from the AppEngine used to login
     */
    accessToken: string;
    /**
     * The key time of the `key` being used.
     */
    keyTime: number;
    /**
     * The key of the map to connect to.
     */
    key: number[];
    /**
     * > Unknown.
     */
    mapJSON: string;
    /**
     * > Unknown.
     */
    entryTag: string;
    /**
     *  The platform the game is played on
     */
    gameNet: string;
    /**
     * > Unknown.
     */
    gameNetUserId: string;
    /**
     * The platform the game is played on
     */
    playPlatform: string;
    /**
     * > Unknown
     */
    platformToken: string;
    /**
     * > Unknown
     */
    userToken: string;
    /**
     * The client token (hwid) of the Unity client
     */
    clientToken: string;
    constructor();
    write(writer: Writer): void;
    read(reader: Reader): void;
    toString(): string;
}
