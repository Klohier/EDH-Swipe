import { useEffect, useState } from "react";
import { Card } from "../types/card";
import CardInfo from "../components/CardInfo";

const STORAGE_KEY = "Cards";
const PAGE_SIZE = 8;

function loadCards(): Card[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function Chosen() {
  const [cards, setCards] = useState<Card[]>(loadCards);
  const [selected, setSelected] = useState<Card | null>(null);
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(cards.length / PAGE_SIZE);
  const pageCards = cards.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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
    }
  }, [page, totalPages]);

  const deleteCard = (name: string) => {
    setCards((prev) => prev.filter((card) => card.Name !== name));
  };

  return (
    <>
      <h1>Chosen</h1>
      <div className="chosen-layout">
        {/* Left: card list */}
        <div className="chosen-list">
          {cards.length === 0 ? (
            <p className="chosen-empty">No cards have been added!</p>
          ) : (
            <>
              <ul className="chosenDisplay">
                {pageCards.map((card) => (
                  <li
                    key={card.Name}
                    className={
                      selected?.Name === card.Name ? "chosen-active" : ""
                    }
                    onClick={() => setSelected(card)}
                  >
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

        {/* Right: selected card preview */}
        <div className="chosen-preview">
          {selected ? (
            <>
              <img
                className="chosen-preview__img"
                src={selected.Img}
                alt={selected.Name}
              />
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
            </>
          ) : (
            <p className="chosen-preview__empty">Select a card to preview it</p>
          )}
        </div>
      </div>
    </>
  );
}
