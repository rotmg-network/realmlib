/**
 * The ID values of all condition effects in the game
 */
export declare enum ConditionEffect {
    NOTHING = 0,
    DEAD = 1,
    QUIET = 2,
    WEAK = 3,
    SLOWED = 4,
    SICK = 5,
    DAZED = 6,
    STUNNED = 7,
    BLIND = 8,
    HALLUCINATING = 9,
    DRUNK = 10,
    CONFUSED = 11,
    STUN_IMMUNE = 12,
    INVISIBLE = 13,
    PARALYZED = 14,
    SPEEDY = 15,
    BLEEDING = 16,
    ARMOR_BROKEN_IMMUNE = 17,
    HEALING = 18,
    DAMAGING = 19,
    BERSERK = 20,
    PAUSED = 21,
    STASIS = 22,
    STASIS_IMMUNE = 23,
    INVINCIBLE = 24,
    INVULNERABLE = 25,
    ARMORED = 26,
    ARMORBROKEN = 27,
    HEXED = 28,
    NINJA_SPEEDY = 29,
    UNSTABLE = 30,
    DARKNESS = 31,
    SLOWED_IMMUNE = 32,
    DAZED_IMMUNE = 33,
    PARALYZED_IMMUNE = 34,
    PETRIFIED = 35,
    PETRIFIED_IMMUNE = 36,
    PET_EFFECT_ICON = 37,
    CURSE = 38,
    CURSE_IMMUNE = 39,
    HP_BOOST = 40,
    MP_BOOST = 41,
    ATT_BOOST = 42,
    DEF_BOOST = 43,
    SPD_BOOST = 44,
    VIT_BOOST = 45,
    WIS_BOOST = 46,
    DEX_BOOST = 47,
    SILENCED = 48,
    EXPOSED = 49,
    ENERGIZED = 50,
    HP_DEBUFF = 51,
    MP_DEBUFF = 52,
    ATT_DEBUFF = 53,
    DEF_DEBUFF = 54,
    SPD_DEBUFF = 55,
    VIT_DEBUFF = 56,
    WIS_DEBUFF = 57,
    DEX_DEBUFF = 58,
    INSPIRED = 59,
    GROUND_DAMAGE = 99
}
/**
 * The bitmask value for each condition effect
 */
export declare enum ConditionEffectBits {
    DEAD = 16,
    QUIET = 32,
    WEAK = 64,
    SLOWED = 128,
    SICK = 16,
    DAZED = 32,
    STUNNED = 64,
    BLIND = 128,
    HALLUCINATING = 256,
    DRUNK = 512,
    CONFUSED = 1024,
    STUN_IMMUNE = 2048,
    INVISIBLE = 4096,
    PARALYZED = 8192,
    SPEEDY = 16384,
    BLEEDING = 32768,
    ARMOR_BROKEN_IMMUNE = 65536,
    HEALING = 131072,
    DAMAGING = 262144,
    BERSERK = 524288,
    PAUSED = 1048576,
    STASIS = 2097152,
    STASIS_IMMUNE = 4194304,
    INVINCIBLE = 8388608,
    INVULNERABLE = 16777216,
    ARMORED = 33554432,
    ARMOR_BROKEN = 67108864,
    HEXED = 134217728,
    NINJA_SPEEDY = 268435456,
    UNSTABLE = 536870912,
    DARKNESS = 1073741824
}
/**
 * The ID values of all visual/particle effects in the game
 */
export declare enum VisualEffect {
    UNKNOWN = 0,
    HEAL = 1,
    TELEPORT = 2,
    STREAM = 3,
    THROW = 4,
    NOVA = 5,
    POISON = 6,
    LINE = 7,
    BURST = 8,
    FLOW = 9,
    RING = 10,
    LIGHTNING = 11,
    COLLAPSE = 12,
    CONEBLAST = 13,
    JITTER = 14,
    FLASH = 15,
    THROW_PROJECTILE = 16,
    SHOCKER = 17,
    SHOCKEE = 18,
    RISING_FURY = 19,
    NOVA_NO_AOE = 20,
    INSPIRED = 21,
    HOLY_BEAM = 22,
    CIRCLE_TELEGRAPH = 23,
    CHAOS_BEAM = 24,
    TELEPORT_MONSTER = 25,
    METEOR = 26,
    GILDED_BUFF = 27,
    JADE_BUFF = 28,
    CHAOS_BUFF = 29,
    THUNDER_BUFF = 30,
    STATUS_FLASH = 31,
    FIRE_ORB_BUFF = 32,
    OVERLAY = 33
}
/**
 * The types of particle effects that exist in the game
 */
export declare enum ParticleEffect {
    CircleParticle = 0,
    CustomParticle = 1,
    ExplosionComplexParticle = 2,
    FountainParticle = 3,
    FountainSnowyParticle = 4,
    HealParticle = 5,
    HeartParticle = 6,
    HitParticle = 7,
    LevelUpParticle = 8,
    RisingFuryParticle = 9,
    ShockParticle = 10,
    SkyBeamParticle = 11,
    SnowflakeParticle = 12,
    SparkerParticle = 13,
    SparkParticle = 14,
    StreamParticle = 15,
    TeleportParticle = 16,
    ThrownProjectile = 17,
    ThrowParticle = 18,
    VentParticle = 19,
    VortexParticle = 20,
    XmlParticle = 21,
    FlowParticle = 22,
    GildedParticle = 23,
    AnimatedParticle = 24,
    SkullParticle = 25,
    MeteorParticle = 26,
    HolyBeamParticle = 27,
    CircleTelegraphParticle = 28,
    SmokeCloudParticle = 29,
    NoteParticle = 30,
    LaserParticle = 31
}
