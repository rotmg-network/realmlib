/// <reference types="node" />
/**
 * An inline-based implementation of the RC4 stream cipher
 */
export declare class RC4 {
    private state;
    private key;
    private i;
    private j;
    /**
     * Constructs a new RC4 cipher object and initializes
     * the Keystream State with the given key
     * @param key The key to use in the Keystream
     */
    constructor(key: Buffer | string);
    /**
     * Performs an inline cipher on the entire contents of the `data` buffer
     * @param data A stream of data to cipher using the Keystream.
     */
    cipher(data: Buffer): void;
    /**
     * Initializes the Keystream State
     */
    reset(): void;
}
/**
 * The RC4 Private Key used to encrypt outgoing packet
 * This key is a Hex String, so should be converted to
 * a Buffer for use
 * @example
 * const key = Buffer.from(OUTGOING_KEY, 'hex');
 */
export declare const OUTGOING_KEY = "5a4d2016bc16dc64883194ffd9";
/**
 * The RC4 Private Key to decrypt incoming packet data.
 * This key is a Hex String, so should be converted to
 * a Buffer for use
 * @example
 * const key = Buffer.from(INCOMING_KEY, 'hex');
 */
export declare const INCOMING_KEY = "c91d9eec420160730d825604e0";
