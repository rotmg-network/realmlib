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

function tagText(xml: string, name: string): string | undefined {
  return new RegExp(`<${name}>([\\s\\S]*?)</${name}>`).exec(xml)?.[1];
}

function tagInt(xml: string, name: string, fallback = 0): number {
  const raw = tagText(xml, name);
  const value = raw === undefined ? NaN : parseInt(raw, 10);
  return Number.isFinite(value) ? value : fallback;
}

/** Parses an `<Equipment>` body (`2504,2648#...,-1,...`) into item ids. */
function parseEquipment(body: string | undefined): number[] {
  if (!body) {
    return [];
  }
  return body.split(',').map((slot) => {
    const id = parseInt(slot.split('#', 1)[0], 10);
    return Number.isFinite(id) ? id : -1;
  });
}

/**
 * Parses the first `<Char>` block in `xml` into a {@link CharacterData}.
 * Returns `undefined` if there is no `<Char>` element.
 */
export function parseCharacterXml(xml: string): CharacterData | undefined {
  const block = /<Char\b[^>]*>[\s\S]*?<\/Char>/.exec(xml)?.[0];
  if (!block) {
    return undefined;
  }
  return {
    id: Number(/<Char\b[^>]*\bid="(\d+)"/.exec(block)?.[1] ?? 0),
    classType: tagInt(block, 'ObjectType'),
    seasonal: /^true$/i.test(tagText(block, 'Seasonal') ?? ''),
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
  for (const match of xml.matchAll(/<Char\b[^>]*>[\s\S]*?<\/Char>/g)) {
    const parsed = parseCharacterXml(match[0]);
    if (parsed) {
      chars.push(parsed);
    }
  }
  return chars;
}
