import { useState, useEffect, useRef } from "react";
import DisplayCard, { DisplayCardHandle } from "../components/DisplayCard";
import CardControls from "../components/CardControls";
import CardFilters, { ColorCode } from "../components/CardFilters";
import { Card } from "../types/card";
import CardInfo from "../components/CardInfo";

const STORAGE_KEY = "Cards";
const PRELOAD_COUNT = 10;
const RATE_LIMIT_DELAY_MS = 75;

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

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchRandomCard(apiUrl: string): Promise<Card> {
  const res = await fetch(apiUrl, {
    headers: {
      "User-Agent": "EDHSwipe/1.0",
      Accept: "application/json",
    },
  });
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
    Colors: json.color_identity ?? [],
    Cmc: json.cmc ?? 0,
  };
}

async function fetchCardsSequentially(
  apiUrl: string,
  count: number,
  signal?: AbortSignal,
): Promise<Card[]> {
  const results: Card[] = [];
  for (let i = 0; i < count; i++) {
    if (signal?.aborted) break;
    if (i > 0) await delay(RATE_LIMIT_DELAY_MS);
    const card = await fetchRandomCard(apiUrl);
    results.push(card);
  }
  return results;
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
    const controller = new AbortController();
    setLoading(true);
    setFilterError(null);
    setDeck([]);
    refilling.current = false;

    fetchCardsSequentially(apiUrl, PRELOAD_COUNT, controller.signal)
      .then((fetched) => {
        if (!controller.signal.aborted) {
          setDeck(fetched);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setFilterError(
            "No commanders found for these filters. Try a different combination.",
          );
          setLoading(false);
        }
      });

    return () => controller.abort();
  }, [apiUrl]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    if (loading || refilling.current || deck.length >= 5) return;
    refilling.current = true;
    const needed = PRELOAD_COUNT - deck.length;
    fetchCardsSequentially(apiUrl, needed).then((newCards) => {
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
      <h1>EDH Swipe</h1>
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
