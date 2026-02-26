import { useState, useEffect } from "react";
import DisplayCard from "../components/DisplayCard";
import CardControls from "../components/CardControls";
import { Card } from "../types/card";
import CardInfo from "../components/CardInfo";

const STORAGE_KEY = "Cards";
const API_URL = "https://api.scryfall.com/cards/random?q=is%3Acommander";

function loadCards(): Card[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function Home() {
  const [currentCard, setCurrentCard] = useState<Card | null>(null);
  const [cards, setCards] = useState<Card[]>(loadCards);
  const [loading, setLoading] = useState(true);

  const fetchCard = () => {
    setLoading(true);
    fetch(API_URL)
      .then((res) => res.json())
      .then((json) => {
        setCurrentCard({
          Name: json.name,
          Img: json.image_uris.png,
          Price: json.prices.usd ?? null,
          ManaCost: json.mana_cost,
          OracleText: json.oracle_text,
          Power: json.power ?? null,
          Toughness: json.toughness ?? null,
        });
        setLoading(false);
      })
      .catch((e) => console.error(`An error occurred: ${e}`));
  };

  useEffect(() => {
    fetchCard();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  const handleYes = () => {
    if (!currentCard || loading) return;
    const isDuplicate = cards.some((card) => card.Name === currentCard.Name);
    if (!isDuplicate) {
      setCards((prev) => [...prev, currentCard]);
    }
    fetchCard();
  };

  return (
    <div className="page">
      <h1>Commander Roulette</h1>

      <DisplayCard card={currentCard} loading={loading} />

      <CardControls loading={loading} onYes={handleYes} onNo={fetchCard} />

      {currentCard && !loading && <CardInfo card={currentCard} />}
    </div>
  );
}
