/**
 * The object types of all classes in the game
 */
export declare enum Classes {
    Rogue = 768,
    Archer = 775,
    Wizard = 782,
    Priest = 784,
    Warrior = 797,
    Knight = 798,
    Paladin = 799,
    Assassin = 800,
    Necromancer = 801,
    Huntress = 802,
    Mystic = 803,
    Trickster = 804,
    Sorcerer = 805,
    Ninja = 806,
    Samurai = 785,
    Bard = 796,
    Summoner = 817
}

/**
 * Return the name of a class given the numerical ID
 * @param classId The class ID
 */
export function parsePlayerClass(classId: number): string {
    switch(classId) {
        case Classes.Rogue: return "Rogue"
        case Classes.Archer: return "Archer"
        case Classes.Wizard: return "Wizard"
        case Classes.Priest: return "Priest"
        case Classes.Warrior: return "Warrior"
        case Classes.Knight: return "Knight"
        case Classes.Paladin: return "Paladin"
        case Classes.Assassin: return "Assassin"
        case Classes.Necromancer: return "Necromancer"
        case Classes.Huntress: return "Huntress"
        case Classes.Mystic: return "Mystic"
        case Classes.Trickster: return "Trickster"
        case Classes.Sorcerer: return "Sorcerer"
        case Classes.Ninja: return "Ninja"
        case Classes.Samurai: return "Samurai"
        case Classes.Bard: return "Bard"
        case Classes.Summoner: return "Summoner"
        default: return "Unknown"
    }
}
