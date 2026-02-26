import { useState, useEffect } from "react";
import { Card } from "../types/card";

export default function DisplayCard() {
  const [data, setData] = useState<Card | null>(null);

  const oldData = JSON.parse(localStorage.getItem("Cards") || "[]");

  const [cards, setCards] = useState<Card[]>(oldData);

  const [loading, setLoading] = useState(true);
  // const [error, setError] = useState(null);
  const api_url = "https://api.scryfall.com/cards/random?q=is%3Acommander";

  const fetchData = () => {
    fetch(api_url)
      .then((response) => response.json())
      .then((data) => {
        setLoading(false);
        setData({
          Name: data["name"],
          Img: data["image_uris"].png,
          Price: data["prices"].usd,
        });
      })
      .catch((e) => {
        console.error(`An error occurred: ${e}`);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClick = () => {
    if (data && !loading) {
      const isDuplicate = cards.some((card) => card.Name === data.Name);

      if (!isDuplicate) {
        setCards([...cards, data]);
        localStorage.setItem("Cards", JSON.stringify([...cards, data]));
        const oldData = JSON.parse(localStorage.getItem("Cards") || "[]");
        console.log("Number of cards:" + oldData.length);
      }
      fetchData();
      setLoading(true);
    }
  };

  const handleClickNo = () => {
    fetchData();
    setLoading(true);
  };

  return (
    <div>
      <h1>Commander Roulette</h1>
      <figure>
        {loading ? (
          <img
            className="display__image"
            src="https://i.imgur.com/LdOBU1I.jpg"
          ></img>
        ) : (
          <img
            id="card-image"
            className="display__image"
            src={data?.Img}
            alt=""
          ></img>
        )}
        <figcaption className="display__caption">
          {data?.Name}{" "}
          {data?.Price === null ? "Price: Unknown" : "Price: $" + data?.Price}
        </figcaption>
      </figure>
      <div className="display__controls">
        <button onClick={handleClickNo}>No </button>
        <button onClick={handleClick} disabled={loading}>
          Yes
        </button>
      </div>
    </div>
  );
}
