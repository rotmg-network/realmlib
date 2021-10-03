import { Packet } from '../../packet';
import { PacketType } from '../../packet-type';
import { Reader } from '../../reader';
import { Writer } from '../../writer';
/**
 * Received to tell the client how many heroes are left in the current realm
 */
export declare class RealmHeroesLeftPacket implements Packet {
    readonly type = PacketType.REALM_HERO_LEFT_MSG;
    /**
     * The number of heroes remaining.
     */
    realmHeroesLeft: number;
    constructor();
    read(reader: Reader): void;
    write(writer: Writer): void;
    toString(): string;
}
