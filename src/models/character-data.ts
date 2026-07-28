/**
 * A character parsed from a `<Char>` XML block. The same schema is used by the
 * `NewCharacterInfoPacket` (`charXML`) and the AppEngine `/char/list` HTTP
 * response, so a single parser serves both.
 */
export interface CharacterData {
  /** The `id` attribute of the `<Char>` element. */
  id: number;
  /** `<ObjectType>` — the class object type (see {@link Classes}). */
  classType: number;
  /** `<Seasonal>` — whether this is a seasonal character. */
  seasonal: boolean;
  /** `<Level>`, or 0 if absent. */
  level: number;
  /** `<Exp>`, or 0 if absent. */
  exp: number;
  /** `<CurrentFame>`, or 0 if absent. */
  currentFame: number;
  /**
   * `<Equipment>` as item ids. Each slot is an item id or `-1` for empty; the
   * server may suffix `#<uniqueData>` (e.g. `2676#6342593521156096`), which is
   * stripped here to leave the item id.
   */
  equipment: number[];
}

/** Raised when a present `<Char>` block violates the supported XML schema. */
export class CharacterXmlParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'CharacterXmlParseError';
  }
}

function decodeXmlText(value: string): string {
  return value.replace(/&(#x[0-9a-f]+|#\d+|amp|apos|gt|lt|quot);/gi, (entity, body: string) => {
    if (body[0] === '#') {
      const hex = body[1].toLowerCase() === 'x';
      const codePoint = Number.parseInt(body.slice(hex ? 2 : 1), hex ? 16 : 10);
      if (!Number.isSafeInteger(codePoint) || codePoint > 0x10ffff) {
        throw new CharacterXmlParseError(`Invalid XML numeric entity: ${entity}`);
      }
      return String.fromCodePoint(codePoint);
    }
    const named: Record<string, string> = {
      amp: '&',
      apos: '\'',
      gt: '>',
      lt: '<',
      quot: '"',
    };
    return named[body.toLowerCase()];
  });
}

function tagText(xml: string, name: string): string | undefined {
  const value = new RegExp(`<${name}\\s*>([\\s\\S]*?)</${name}\\s*>`).exec(xml)?.[1];
  return value === undefined ? undefined : decodeXmlText(value.trim());
}

function parseInteger(raw: string, field: string): number {
  if (!/^[+-]?\d+$/.test(raw)) {
    throw new CharacterXmlParseError(`${field} must be an integer`);
  }
  const value = Number(raw);
  if (!Number.isSafeInteger(value)) {
    throw new CharacterXmlParseError(`${field} exceeds the safe integer range`);
  }
  return value;
}

function tagInt(xml: string, name: string, required = false): number {
  const raw = tagText(xml, name);
  if (raw === undefined) {
    if (required) {
      throw new CharacterXmlParseError(`Missing required <${name}> value`);
    }
    return 0;
  }
  return parseInteger(raw, `<${name}>`);
}

/** Parses an `<Equipment>` body (`2504,2648#...,-1,...`) into item ids. */
function parseEquipment(body: string | undefined): number[] {
  if (body === undefined || body === '') {
    return [];
  }
  return body.split(',').map((slot, index) => {
    const id = slot.split('#', 1)[0].trim();
    return parseInteger(id, `<Equipment> slot ${index}`);
  });
}

function characterId(block: string): number {
  const openingTag = /^<Char\b[^>]*>/.exec(block)?.[0];
  const raw = openingTag
    ? /\bid\s*=\s*(?:"([^"]*)"|'([^']*)')/.exec(openingTag)
    : undefined;
  if (!raw) {
    throw new CharacterXmlParseError('Missing required Char id attribute');
  }
  return parseInteger(decodeXmlText((raw[1] ?? raw[2]).trim()), 'Char id');
}

/**
 * Parses the first `<Char>` block in `xml` into a {@link CharacterData}.
 * Returns `undefined` if there is no `<Char>` element. The accepted schema is
 * deliberately small; malformed required ids and numeric fields throw instead
 * of being converted into plausible zero values.
 */
export function parseCharacterXml(xml: string): CharacterData | undefined {
  const block = /<Char\b[^>]*>[\s\S]*?<\/Char\s*>/.exec(xml)?.[0];
  if (!block) {
    if (/<Char\b/.test(xml)) {
      throw new CharacterXmlParseError('Incomplete <Char> block');
    }
    return undefined;
  }
  const seasonal = tagText(block, 'Seasonal');
  if (seasonal !== undefined && !/^(?:true|false)$/i.test(seasonal)) {
    throw new CharacterXmlParseError('<Seasonal> must be true or false');
  }
  return {
    id: characterId(block),
    classType: tagInt(block, 'ObjectType', true),
    seasonal: /^true$/i.test(seasonal ?? ''),
    level: tagInt(block, 'Level'),
    exp: tagInt(block, 'Exp'),
    currentFame: tagInt(block, 'CurrentFame'),
    equipment: parseEquipment(tagText(block, 'Equipment')),
  };
}

/**
 * Parses every `<Char>` block in `xml` (e.g. an AppEngine `/char/list`
 * response) into {@link CharacterData} entries.
 */
export function parseCharacterListXml(xml: string): CharacterData[] {
  const chars: CharacterData[] = [];
  let blockCount = 0;
  for (const match of xml.matchAll(/<Char\b[^>]*>[\s\S]*?<\/Char\s*>/g)) {
    blockCount++;
    const parsed = parseCharacterXml(match[0]);
    if (parsed) {
      chars.push(parsed);
    }
  }
  const openingCount = xml.match(/<Char\b/g)?.length ?? 0;
  if (openingCount !== blockCount) {
    throw new CharacterXmlParseError('Incomplete <Char> block in character list');
  }
  return chars;
}
