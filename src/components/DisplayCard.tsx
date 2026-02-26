import { useRef, forwardRef, useImperativeHandle } from "react";
import { gsap } from "gsap";
import { Draggable } from "gsap/Draggable";
import { useGSAP } from "@gsap/react";
import { Card } from "../types/card";

gsap.registerPlugin(Draggable);

export interface DisplayCardHandle {
  flyOff: (direction: "yes" | "no") => void;
}

interface Props {
  deck: Card[];
  loading: boolean;
  onYes: () => void;
  onNo: () => void;
}

const DisplayCard = forwardRef<DisplayCardHandle, Props>(
  ({ deck, loading, onYes, onNo }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const onYesRef = useRef(onYes);
    const onNoRef = useRef(onNo);
    onYesRef.current = onYes;
    onNoRef.current = onNo;

    const flyOffRef = useRef<((direction: "yes" | "no") => void) | null>(null);

    useImperativeHandle(ref, () => ({
      flyOff: (direction) => flyOffRef.current?.(direction),
    }));

    useGSAP(
      () => {
        if (loading || deck.length === 0) return;

        const container = containerRef.current;
        if (!container) return;

        const timer = setTimeout(() => {
          const card = container.querySelector<HTMLElement>(".deck__top");
          const hintYes =
            container.querySelector<HTMLElement>(".deck__hint--yes");
          const hintNo =
            container.querySelector<HTMLElement>(".deck__hint--no");
          if (!card) return;

          Draggable.get(card)?.kill();
          gsap.set(card, { x: 0, rotation: 0, opacity: 1 });

          const resetHints = () => {
            if (hintYes) hintYes.style.opacity = "0";
            if (hintNo) hintNo.style.opacity = "0";
          };

          const flyOff = (direction: "yes" | "no") => {
            Draggable.get(card)?.kill();
            gsap.to(card, {
              x: direction === "yes" ? 600 : -600,
              rotation: direction === "yes" ? 30 : -30,
              opacity: 0,
              duration: 0.35,
              ease: "power2.in",
              onComplete: () => {
                resetHints();
                direction === "yes" ? onYesRef.current() : onNoRef.current();
              },
            });
          };

          flyOffRef.current = flyOff;

          Draggable.create(card, {
            type: "x",
            onDrag() {
              gsap.set(card, { rotation: (this.x / 200) * 15 });
              const absX = Math.abs(this.x);
              if (this.x > 40) {
                if (hintYes)
                  hintYes.style.opacity = String(Math.min(1, this.x / 120));
                if (hintNo) hintNo.style.opacity = "0";
              } else if (this.x < -40) {
                if (hintNo)
                  hintNo.style.opacity = String(Math.min(1, absX / 120));
                if (hintYes) hintYes.style.opacity = "0";
              } else {
                resetHints();
              }
            },
            onDragEnd() {
              if (this.x > 120) {
                flyOff("yes");
              } else if (this.x < -120) {
                flyOff("no");
              } else {
                gsap.to(card, {
                  x: 0,
                  rotation: 0,
                  duration: 0.4,
                  ease: "elastic.out(1, 0.6)",
                });
                resetHints();
              }
            },
          });
        }, 0);

        return () => {
          clearTimeout(timer);
          flyOffRef.current = null;
          const card =
            containerRef.current?.querySelector<HTMLElement>(".deck__top");
          if (card) Draggable.get(card)?.kill();
        };
      },
      {
        scope: containerRef,
        dependencies: [deck[0]?.id, loading],
      },
    );

    if (loading) {
      return (
        <div className="deck">
          <img
            className="deck__card"
            src="https://i.imgur.com/LdOBU1I.jpg"
            alt="Loading"
            style={{ zIndex: 10 }}
          />
        </div>
      );
    }

    const [topCard, ...rest] = deck;

    return (
      <div ref={containerRef}>
        <div className="deck-hints">
          <span className="deck__hint--no">✗ Skip</span>
          <span className="deck__hint--yes">✓ Add</span>
        </div>
        <div className="deck">
          {rest
            .slice(0, 3)
            .reverse()
            .map((card, i) => (
              <img
                key={card.id}
                className="deck__card"
                src={card.Img}
                alt={card.Name}
                style={{
                  zIndex: i,
                  top: `${(3 - i) * 18}px`,
                  filter: `brightness(${1 - (3 - i) * 0.2})`,
                  cursor: "default",
                  pointerEvents: "none",
                }}
              />
            ))}
          {topCard && (
            <img
              className="deck__card deck__top"
              src={topCard.Img}
              alt={topCard.Name}
              style={{ zIndex: 4, top: 0, cursor: "grab" }}
            />
          )}
        </div>
      </div>
    );
  },
);

DisplayCard.displayName = "DisplayCard";
export default DisplayCard;
