import {WorldPosData} from '../../data';
import {Packet} from '../../packet';
import {PacketType} from '../../packet-type';
import {Reader} from '../../reader';
import {Writer} from '../../writer';

/**
 * Sent when the player shoots a projectile.
 */
export class PlayerShootPacket implements Packet {

    readonly type = PacketType.PLAYERSHOOT;

    //#region packet-specific members
    /**
     * The current client time.
     */
    time: number;
    /**
     * The id of the bullet which was fired.
     */
    bulletId: number;
    /**
     * (work-in-progress)
     */
    unknownByte: number;
    /**
     * The item id of the weapon used to fire the projectile.
     */
    containerType: number;
    /**
     * The position of the starting point where the projectile was fired.
     */
    startingPos: WorldPosData;
    /**
     * The angle at which the projectile was fired.
     */
    angle: number;
    /**
     * The speed multiplier for the projectile.
     */
    speedMult: number;
    /**
     * The lifetime MS multiplier for the projectile.
     */
    lifeMult: number;
    /**
     * If the projectile is related to a burst weapon projectile.
     */
    isBurst: boolean;

    //#endregion

    constructor() {
        this.time = 0;
        this.bulletId = 0;
        this.unknownByte = 0;
        this.containerType = 0;
        this.startingPos = new WorldPosData();
        this.angle = 0;
        this.speedMult = 0;
        this.lifeMult = 0;
        this.isBurst = false;
    }

    write(writer: Writer): void {
        writer.writeInt32(this.time);
        writer.writeByte(this.bulletId);
        writer.writeByte(this.unknownByte)
        writer.writeShort(this.containerType);
        this.startingPos.write(writer);
        writer.writeFloat(this.angle);
        // NB(thomas-crane): the client uses AS3's `int` function which is
        // equivalent to `Math.floor` in JS.
        writer.writeShort(Math.floor(this.speedMult * 1000));
        writer.writeShort(Math.floor(this.lifeMult * 1000));
        writer.writeBoolean(this.isBurst);
    }

    read(reader: Reader): void {
        this.time = reader.readInt32();
        this.bulletId = reader.readByte();
        this.unknownByte = reader.readByte();
        this.containerType = reader.readShort();
        this.startingPos.read(reader);
        this.angle = reader.readFloat();
        this.speedMult = Math.floor(reader.readShort() / 1000);
        this.lifeMult = Math.floor(reader.readShort() / 1000);
        this.isBurst = reader.readBoolean();
    }
}
