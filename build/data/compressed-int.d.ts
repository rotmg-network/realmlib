import { Reader } from '../reader';
import { Writer } from '../writer';
/**
 * A class for dealing with DECA's new style of integer compression
 */
export declare class CompressedInt {
    /**
     * Pass a reader and read the compressed in
     * @param reader
     */
    read(reader: Reader): number;
    /**
     * Pass a writer and write the compressed as a number
     * @param writer
     * @param amount The value you wish to compress
     */
    write(writer: Writer, amount: number): void;
}
