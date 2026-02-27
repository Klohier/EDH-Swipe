interface Props {
  loading: boolean;
  onYes: () => void;
  onNo: () => void;
}

export default function CardControls({ loading, onYes, onNo }: Props) {
  return (
    <div className="display__controls">
      <button className="btn btn--danger" onClick={onNo}>
        No
      </button>
      <button className="btn" onClick={onYes} disabled={loading}>
        Yes
      </button>
    </div>
  );
}
