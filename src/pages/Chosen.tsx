import { useEffect, useState } from "react";
import { Card } from "../types/card";

const STORAGE_KEY = "Cards";

function loadCards(): Card[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export default function Chosen() {
  const [cards, setCards] = useState<Card[]>(loadCards);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
  }, [cards]);

  const deleteCard = (name: string) => {
    setCards((prev) => prev.filter((card) => card.Name !== name));
  };

  return (
    <>
      <h1>Chosen</h1>
      <div className="cardback">
        {cards.length === 0 ? (
          <p>No cards have been added!</p>
        ) : (
          <ul className="chosenDisplay">
            {cards.map((card) => (
              <li key={card.Name}>
                <p onClick={() => console.log(card.Name)}>{card.Name}</p>
                <button
                  className="deleteButton"
                  onClick={() => deleteCard(card.Name)}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="selectedCard" />
    </>
  );
}
