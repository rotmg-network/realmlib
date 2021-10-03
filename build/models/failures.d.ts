/**
 * The error codes of messages which can be received in the FailurePacket
 */
export declare enum FailureCode {
    /**
     * Received when the game version sent in the HelloPacket is not updated
     */
    IncorrectVersion = 4,
    /**
     * Received when an incorrect key is sent in the HelloPacket
     */
    BadKey = 5,
    /**
     * Received when the target of a TeleportPacket was not a valid target
     */
    InvalidTeleportTarget = 6,
    /**
     * Received when the account that has connected does not have a verified email
     */
    EmailVerificationNeeded = 7,
    /**
     * Received on teleport when the client has the non-guild cooldown
     */
    TeleportRealmBlock = 9,
    /**
     * Received when the client enters the wrong server
     */
    WrongServerEntered = 10,
    /**
     * Received when the server is full or you try enter an area without a valid reconnect key
     */
    ServerFull = 11,
    /**
     * Received when the server the client enters has a queue
     */
    ServerQueue = 15
}
/**
 * Common failure packet messages for when the error code is 0
 */
export declare enum FailureMessage {
    CharacterDead = "Character is dead",
    CharacterNotFound = "Character not found",
    TemporaryBan = "Your IP has been temporarily banned for abuse/hacking on this server"
}
/**
 * Most possible protocol error codes and their meaning
 */
export declare enum ProtocolError {
    /**
     * Received if you send a MOVE packet not in response to a new tick
     */
    IncorrectMove = 5,
    /**
     * Received if you send a pong packet not in response to a ping
     */
    IncorrectPong = 9,
    /**
     * Received if a pong packet is sent with an invalid serial number
     */
    IncorrectPongSerial = 10,
    /**
     * Received if you send an UPDATEACK not in response to an UPDATE
     */
    IncorrectUpdateAck = 11,
    /**
     * Received if you send a HELLO packet while already in-game
     */
    IncorrectHello = 15,
    /**
     * Received when an ACK packet is not sent (ping, goto, newtick, update)
     */
    IgnoredAck = 21,
    /**
     * Received when too many packets are sent in a short duration (1200+ at once)
     */
    TooManyPackets = 42,
    /**
     * Received if there are too many in-game entities for the server to handle
     */
    TooManyEntities = 48,
    /**
     * Received when sending packets too quickly after getting "action not permitted at the moment" in-game
     */
    RateLimit = 64
}
