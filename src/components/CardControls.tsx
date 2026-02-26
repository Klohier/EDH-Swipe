interface Props {
  loading: boolean;
  onYes: () => void;
  onNo: () => void;
}

export default function CardControls({ loading, onYes, onNo }: Props) {
  return (
    <div className="display__controls">
      <button onClick={onNo}>No</button>
      <button onClick={onYes} disabled={loading}>
        Yes
      </button>
    </div>
  );
}
