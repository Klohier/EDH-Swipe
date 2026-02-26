export interface Card {
  id: string;
  Name: string;
  Img: string;
  Price: string | null;
  ManaCost: string;
  Colors: string[];
  Cmc: number;
  OracleText: string;
  Power: string | null;
  Toughness: string | null;
  EdhrecUrl: string;
}
