const COLORS = [
  { code: "W", label: "White", symbol: "☀️" },
  { code: "U", label: "Blue", symbol: "💧" },
  { code: "B", label: "Black", symbol: "💀" },
  { code: "R", label: "Red", symbol: "🔥" },
  { code: "G", label: "Green", symbol: "🌲" },
] as const;

export type ColorCode = (typeof COLORS)[number]["code"];

export const CMC_OPTIONS = [
  { label: "Any", value: null },
  { label: "1–2", value: "cmc<=2" },
  { label: "3–4", value: "cmc>=3+cmc<=4" },
  { label: "5–6", value: "cmc>=5+cmc<=6" },
  { label: "7+", value: "cmc>=7" },
];

interface Props {
  selectedColors: ColorCode[];
  selectedCmc: string | null;
  onToggleColor: (code: ColorCode) => void;
  onSetCmc: (value: string | null) => void;
  onClear: () => void;
}

export default function CardFilters({
  selectedColors,
  selectedCmc,
  onToggleColor,
  onSetCmc,
  onClear,
}: Props) {
  const hasFilters = selectedColors.length > 0 || selectedCmc !== null;

  return (
    <div className="filter-bar">
      <div className="filter-section">
        <span className="filter-label">Colors</span>
        <div className="filter-colors">
          {COLORS.map(({ code, label, symbol }) => {
            const active = selectedColors.includes(code);
            return (
              <button
                key={code}
                className={`color-btn${active ? " color-btn--active" : ""}`}
                onClick={() => onToggleColor(code)}
                title={label}
                aria-pressed={active}
                type="button"
              >
                <span className="color-btn__symbol">{symbol}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="filter-section">
        <span className="filter-label">Mana Value</span>
        <div className="filter-cmc">
          {CMC_OPTIONS.map(({ label, value }) => (
            <button
              key={label}
              className={`cmc-btn${selectedCmc === value ? " cmc-btn--active" : ""}`}
              onClick={() => onSetCmc(value)}
              type="button"
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {hasFilters && (
        <button className="filter-clear" onClick={onClear} type="button">
          Clear filters
        </button>
      )}
    </div>
  );
}
