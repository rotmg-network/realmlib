import { Reader } from '../reader';

/* tslint:disable:no-bitwise */
export function read(reader: Reader): number {
    let value = 0;
    let uByte = reader.readUnsignedByte();
    const isNegative = (uByte & 64) !== 0;
    let shift = 6;
    value = uByte & 63;

    while (uByte & 128) {
        uByte = reader.readUnsignedByte();
        value = value | (uByte & 127) << shift;
        shift += 7;
    }

    if (isNegative) {
        value = -value;
    }
    return value;
}
/* tslint:enable:no-bitwise */