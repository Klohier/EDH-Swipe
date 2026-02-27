import { useEffect, useState } from "react";
import { Card } from "../types/card";
import CardInfo from "../components/CardInfo";
import CardFilters, { ColorCode } from "../components/CardFilters";
import Footer from "../components/Footer";

const STORAGE_KEY = "Cards";
const PAGE_SIZE = 8;

function loadCards(): Card[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function applyFilters(
  cards: Card[],
  selectedColors: ColorCode[],
  selectedCmc: string | null,
): Card[] {
  return cards.filter((card) => {
    if (selectedColors.length > 0) {
      const onlySelected = card.Colors.every((c) =>
        selectedColors.includes(c as ColorCode),
      );
      const hasAtLeastOne = card.Colors.some((c) =>
        selectedColors.includes(c as ColorCode),
      );
      if (!onlySelected || !hasAtLeastOne) return false;
    }

    if (selectedCmc) {
      const cmc = card.Cmc;
      if (selectedCmc === "cmc<=2" && cmc > 2) return false;
      if (selectedCmc === "cmc>=3+cmc<=4" && (cmc < 3 || cmc > 4)) return false;
      if (selectedCmc === "cmc>=5+cmc<=6" && (cmc < 5 || cmc > 6)) return false;
      if (selectedCmc === "cmc>=7" && cmc < 7) return false;
    }

    return true;
  });
}
export default function Chosen() {
  const [cards, setCards] = useState<Card[]>(loadCards);
  const [selected, setSelected] = useState<Card | null>(null);
  const [page, setPage] = useState(0);
  const [selectedColors, setSelectedColors] = useState<ColorCode[]>([]);
  const [selectedCmc, setSelectedCmc] = useState<string | null>(null);

  const filtered = applyFilters(cards, selectedColors, selectedCmc);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const pageCards = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  useEffect(() => {
    if (selected && !cards.find((c) => c.Name === selected.Name)) {
      setSelected(null);
    }
  }, [cards, selected]);

  useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(totalPages - 1);
    } else if (totalPages === 0) {
      setPage(0);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(0);
  }, [selectedColors, selectedCmc]);

  useEffect(() => {
    if (selected) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const toggleColor = (code: ColorCode) => {
    setSelectedColors((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const clearFilters = () => {
    setSelectedColors([]);
    setSelectedCmc(null);
  };

  const deleteCard = (name: string) => {
    setCards((prev) => prev.filter((card) => card.Name !== name));
  };

  return (
    <div className="page">
      <h1>Chosen</h1>

      <CardFilters
        selectedColors={selectedColors}
        selectedCmc={selectedCmc}
        onToggleColor={toggleColor}
        onSetCmc={setSelectedCmc}
        onClear={clearFilters}
      />

      <div className="cardback">
        {cards.length === 0 ? (
          <p className="chosen-empty">No cards have been added!</p>
        ) : filtered.length === 0 ? (
          <p className="chosen-empty">No cards match these filters.</p>
        ) : (
          <>
            <ul className="chosenDisplay">
              {pageCards.map((card) => (
                <li key={card.Name} onClick={() => setSelected(card)}>
                  <span className="chosen-card-name">{card.Name}</span>
                  <button
                    className="deleteButton"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteCard(card.Name);
                    }}
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>

            {totalPages > 1 && (
              <div className="chosen-pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  ‹
                </button>
                <span className="page-label">
                  {page + 1} / {totalPages}
                </span>
                <button
                  className="page-btn"
                  onClick={() =>
                    setPage((p) => Math.min(totalPages - 1, p + 1))
                  }
                  disabled={page === totalPages - 1}
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelected(null)}>
              ✕
            </button>
            <div className="modal-body">
              <img
                className="modal-img"
                src={selected.Img}
                alt={selected.Name}
              />
              <div className="modal-info">
                <CardInfo card={selected} />
                {selected.EdhrecUrl && (
                  <a
                    className="edhrec-link"
                    href={selected.EdhrecUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on EDHREC →
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
