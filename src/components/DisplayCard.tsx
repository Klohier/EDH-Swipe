import { Card } from "../types/card";

interface Props {
  card: Card | null;
  loading: boolean;
}

export default function DisplayCard({ card, loading }: Props) {
  return (
    <figure>
      {loading ? (
        <img
          className="display__image"
          src="https://i.imgur.com/LdOBU1I.jpg"
          alt="Loading"
        />
      ) : (
        <img className="display__image" src={card?.Img} alt={card?.Name} />
      )}
    </figure>
  );
}
