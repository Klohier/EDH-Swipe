import { useState, useEffect, useRef } from "react";
import DisplayCard from "../components/DisplayCard";
import CardControls from "../components/CardControls";
import { Card } from "../types/card";
import CardInfo from "../components/CardInfo";

const STORAGE_KEY = "Cards";
const API_URL = "https://api.scryfall.com/cards/random?q=is%3Acommander";
const PRELOAD_COUNT = 10;

function loadCards(): Card[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

async function fetchRandomCard(): Promise<Card> {
  const res = await fetch(API_URL);
  const json = await res.json();
  const imageUris = json.image_uris ?? json.card_faces?.[0]?.image_uris;
  if (!imageUris) return fetchRandomCard();

  return {
    id: crypto.randomUUID(),
    Name: json.name,
    Img: imageUris.png,
    Price: json.prices?.usd ?? null,
    ManaCost: json.mana_cost ?? json.card_faces?.[0]?.mana_cost ?? "",
    OracleText: json.oracle_text ?? json.card_faces?.[0]?.oracle_text ?? "",
    Power: json.power ?? null,
    Toughness: json.toughness ?? null,
  };
}

export default function Home() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [cards, setCards] = useState<Card[]>(loadCards);
  const [loading, setLoading] = useState(true);
  const refilling = useRef(false);

  useEffect(() => {
    setLoading(true);
    Promise.all(Array.from({ length: PRELOAD_COUNT }, fetchRandomCard))
      .then((fetched) => {
        setDeck(fetched);
        setLoading(false);
      })
      .catch((e) => console.error(`An error occurred: ${e}`));
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    if (loading || refilling.current || deck.length >= 5) return;
    refilling.current = true;
    const needed = PRELOAD_COUNT - deck.length;
    Promise.all(Array.from({ length: needed }, fetchRandomCard)).then(
      (newCards) => {
        setDeck((d) => [...d, ...newCards]);
        refilling.current = false;
      },
    );
  }, [deck, loading]);

  const currentCard = deck[0] ?? null;

  const advance = () => {
    setDeck((prev) => prev.slice(1));
  };

  const handleYes = () => {
    if (!currentCard || loading) return;
    const isDuplicate = cards.some((card) => card.Name === currentCard.Name);
    if (!isDuplicate) setCards((prev) => [...prev, currentCard]);
    advance();
  };

  return (
    <div className="page">
      <h1>Commander Roulette</h1>

      <DisplayCard
        deck={deck}
        loading={loading}
        onYes={handleYes}
        onNo={advance}
      />
      <CardControls loading={loading} onYes={handleYes} onNo={advance} />
      {currentCard && !loading && <CardInfo card={currentCard} />}
    </div>
  );
}
