import { expect } from 'chai';
import {
  NewCharacterInfoPacket,
  parseCharacterListXml,
  parseCharacterXml,
} from '../src';

// A /char/list-shaped char (plain equipment ids), from a captured response.
const CHAR_LIST_XML =
  '<Chars nextCharId="192" maxNumChars="3">' +
  '<Char id="173"><ObjectType>797</ObjectType><Seasonal>False</Seasonal>' +
  '<Level>20</Level><Exp>4523072</Exp><CurrentFame>2272</CurrentFame>' +
  '<Equipment>2504,2667,2812,-1</Equipment></Char>' +
  '<Char id="180"><ObjectType>782</ObjectType><Seasonal>True</Seasonal>' +
  '<Level>1</Level><Exp>0</Exp><CurrentFame>0</CurrentFame>' +
  '<Equipment>-1,-1,-1,-1</Equipment></Char></Chars>';

// A NEW_CHARACTER_INFORMATION-shaped char (equipment ids with #uniqueData).
const PACKET_XML =
  '<Char id="263"><ObjectType>768</ObjectType><Seasonal>True</Seasonal>' +
  '<Level>1</Level><Exp>0</Exp><CurrentFame>0</CurrentFame>' +
  '<Equipment>2676#6342593521156096,2648#4935218637602816,-1,-1</Equipment></Char>';

describe('character-data XML parser', () => {
  it('parses a single char and strips #uniqueData from equipment', () => {
    const c = parseCharacterXml(PACKET_XML)!;
    expect(c.id).to.equal(263);
    expect(c.classType).to.equal(768);
    expect(c.seasonal).to.equal(true);
    expect(c.equipment).to.deep.equal([2676, 2648, -1, -1]);
  });

  it('parses a full char-list into multiple entries', () => {
    const chars = parseCharacterListXml(CHAR_LIST_XML);
    expect(chars).to.have.length(2);
    expect(chars[0]).to.include({ id: 173, classType: 797, seasonal: false, level: 20, currentFame: 2272 });
    expect(chars[0].equipment).to.deep.equal([2504, 2667, 2812, -1]);
    expect(chars[1]).to.include({ id: 180, seasonal: true, level: 1 });
  });

  it('returns undefined when there is no <Char> block', () => {
    expect(parseCharacterXml('<Chars></Chars>')).to.equal(undefined);
    expect(parseCharacterListXml('<Chars></Chars>')).to.deep.equal([]);
  });

  it('NewCharacterInfoPacket.character parses its own charXML', () => {
    const p = new NewCharacterInfoPacket();
    p.charXML = PACKET_XML;
    expect(p.character?.id).to.equal(263);
    expect(p.character?.classType).to.equal(768);
  });
});
