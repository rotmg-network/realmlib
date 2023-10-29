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
     * The item id of the weapon used to fire the projectile.
     */
    containerType: number;
    /**
     * (work-in-progress)
     */
    unknownByte: number;
    /**
     * The position of the starting point where the projectile was fired.
     */
    startingPos: WorldPosData;
    /**
     * The angle at which the projectile was fired.
     */
    angle: number;
    /**
     * If the projectile is related to a burst weapon projectile.
     */
    isBurst: boolean;
    /**
     * No Fucking idea
     */
    unknownShort: number;
    /**
     * The Player Position 
     */
    playerPos: WorldPosData;

    //#endregion

    constructor() {
        this.time = 0;
        this.bulletId = 0;
        this.containerType = 0;
        this.unknownByte = 0;
        this.startingPos = new WorldPosData();
        this.angle = 0;
        this.isBurst = false;
        this.unknownShort = 0;
        this.playerPos = new WorldPosData();
    }

    write(writer: Writer): void {
        writer.writeInt32(this.time);
        writer.writeShort(this.bulletId);
        writer.writeShort(this.unknownByte)
        writer.writeByte(this.containerType);
        this.startingPos.write(writer);
        writer.writeFloat(this.angle);
        writer.writeBoolean(this.isBurst);
        writer.writeShort(this.unknownShort);
        this.playerPos.write(writer)
    }

    read(reader: Reader): void {
        this.time = reader.readInt32();
        this.bulletId = reader.readByte();
        this.containerType = reader.readShort();
        this.unknownByte = reader.readByte();
        this.startingPos.read(reader);
        this.angle = reader.readFloat();
        this.isBurst = reader.readBoolean();
        this.unknownShort = reader.readShort();
        this.playerPos.read(reader);
    }
}
