import { useState, useEffect, useRef } from "react";
import DisplayCard, { DisplayCardHandle } from "../components/DisplayCard";
import CardControls from "../components/CardControls";
import CardFilters, { ColorCode } from "../components/CardFilters";
import { Card } from "../types/card";
import CardInfo from "../components/CardInfo";

const STORAGE_KEY = "Cards";
const PRELOAD_COUNT = 10;

const COLOR_ORDER = ["W", "U", "B", "R", "G"];
function sortColors(colors: ColorCode[]): string {
  return COLOR_ORDER.filter((c) => colors.includes(c as ColorCode)).join("");
}

function buildApiUrl(selectedColors: ColorCode[], cmc: string | null): string {
  let query = "is%3Acommander";
  if (selectedColors.length > 0) {
    query += `+id=${sortColors(selectedColors)}`;
  }
  if (cmc) {
    query += `+${cmc}`;
  }
  return `https://api.scryfall.com/cards/random?q=${query}`;
}

function loadCards(): Card[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

async function fetchRandomCard(apiUrl: string): Promise<Card> {
  const res = await fetch(apiUrl);
  const json = await res.json();
  if (json.object === "error") throw new Error(json.details);
  const imageUris = json.image_uris ?? json.card_faces?.[0]?.image_uris;
  if (!imageUris) return fetchRandomCard(apiUrl);

  return {
    id: crypto.randomUUID(),
    Name: json.name,
    Img: imageUris.png,
    Price: json.prices?.usd ?? null,
    ManaCost: json.mana_cost ?? json.card_faces?.[0]?.mana_cost ?? "",
    OracleText: json.oracle_text ?? json.card_faces?.[0]?.oracle_text ?? "",
    Power: json.power ?? null,
    Toughness: json.toughness ?? null,
    EdhrecUrl: json.related_uris?.edhrec ?? "",
  };
}

export default function Home() {
  const [deck, setDeck] = useState<Card[]>([]);
  const [cards, setCards] = useState<Card[]>(loadCards);
  const [loading, setLoading] = useState(true);
  const [filterError, setFilterError] = useState<string | null>(null);
  const [selectedColors, setSelectedColors] = useState<ColorCode[]>([]);
  const [selectedCmc, setSelectedCmc] = useState<string | null>(null);
  const refilling = useRef(false);
  const displayCardRef = useRef<DisplayCardHandle>(null);
  const apiUrl = buildApiUrl(selectedColors, selectedCmc);

  useEffect(() => {
    setLoading(true);
    setFilterError(null);
    setDeck([]);
    refilling.current = false;
    Promise.all(
      Array.from({ length: PRELOAD_COUNT }, () => fetchRandomCard(apiUrl)),
    )
      .then((fetched) => {
        setDeck(fetched);
        setLoading(false);
      })
      .catch(() => {
        setFilterError(
          "No commanders found for these filters. Try a different combination.",
        );
        setLoading(false);
      });
  }, [apiUrl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    if (loading || refilling.current || deck.length >= 5) return;
    refilling.current = true;
    const needed = PRELOAD_COUNT - deck.length;
    Promise.all(
      Array.from({ length: needed }, () => fetchRandomCard(apiUrl)),
    ).then((newCards) => {
      setDeck((d) => [...d, ...newCards]);
      refilling.current = false;
    });
  }, [deck, loading, apiUrl]);

  const currentCard = deck[0] ?? null;

  const toggleColor = (code: ColorCode) => {
    setSelectedColors((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedCmc(null);
  };

  const advance = () => setDeck((prev) => prev.slice(1));

  const handleYes = () => {
    if (!currentCard || loading) return;
    const isDuplicate = cards.some((card) => card.Name === currentCard.Name);
    if (!isDuplicate) setCards((prev) => [...prev, currentCard]);
    advance();
  };

  const handleYesWithAnimation = () => {
    if (loading) return;
    displayCardRef.current?.flyOff("yes");
  };

  const handleNoWithAnimation = () => {
    if (loading) return;
    displayCardRef.current?.flyOff("no");
  };

  return (
    <div className="page">
      <h1>Commander Roulette</h1>
      <p className="app-blurb">
        Can't decide on a commander? Swipe right to add a card to your
        shortlist, or left to skip it. Head to <strong>Chosen</strong> when
        you're done to review your picks and find deck-building inspiration on
        EDHREC.
      </p>

      <CardFilters
        selectedColors={selectedColors}
        selectedCmc={selectedCmc}
        onToggleColor={toggleColor}
        onSetCmc={setSelectedCmc}
        onClear={clearFilters}
      />

      {filterError ? (
        <p className="filter-error">{filterError}</p>
      ) : (
        <>
          <DisplayCard
            ref={displayCardRef}
            deck={deck}
            loading={loading}
            onYes={handleYes}
            onNo={advance}
          />
          <CardControls
            loading={loading}
            onYes={handleYesWithAnimation}
            onNo={handleNoWithAnimation}
          />
          {currentCard && !loading && <CardInfo card={currentCard} />}
        </>
      )}
    </div>
  );
}
