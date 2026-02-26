import { Card } from "../types/card";

interface Props {
  card: Card;
}

export default function CardInfo({ card }: Props) {
  return (
    <section className="card-info">
      <h2 className="card-info__name">{card.Name}</h2>
      <div className="card-info__divider" />
      <div className="card-info__grid">
        <div className="card-info__field">
          <span className="card-info__label">Mana Cost</span>
          <span className="card-info__value">{card.ManaCost || "—"}</span>
        </div>
        <div className="card-info__field">
          <span className="card-info__label">Price</span>
          <span className="card-info__value">
            {card.Price == null ? "Unknown" : `$${card.Price}`}
          </span>
        </div>
        {card.Power != null && card.Toughness != null && (
          <div className="card-info__field">
            <span className="card-info__label">Power / Toughness</span>
            <span className="card-info__value">
              {card.Power} / {card.Toughness}
            </span>
          </div>
        )}
      </div>
      <div className="card-info__oracle">
        <span className="card-info__label">Oracle Text</span>
        <p className="card-info__oracle-text">{card.OracleText}</p>
      </div>
    </section>
  );
}
