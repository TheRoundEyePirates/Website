import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextFlippingBoard } from './ui/text-flipping-board';

gsap.registerPlugin(ScrollTrigger);

const MESSAGES = [
  "STAY ON COURSE\nKEEP ONE EYE\nON THE HORIZON",
  "WHAT DID YOU\nSHIP THIS WEEK?",
  "ANCHORS AWEIGH\nBUILD SEASON\n2026-2027",
  "HASTINGS & NAPIER\nHAWKE'S BAY\nNEW ZEALAND",
  "WELCOME ABOARD\nTHE ROUND EYE\nPIRATES",
] as const;

const IDLE_MS = 5000;

/**
 * Scroll-driven split-flap board. As the section scrolls through the
 * viewport, the board flips from message to message. While it stays in
 * view (and scroll is idle) it keeps cycling on its own so the board is
 * never a static picture.
 */
export default function TextFlippingBoardDemo() {
  const [msgIdx, setMsgIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const msgRef = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advance = (idx: number) => {
    msgRef.current = idx;
    setMsgIdx(idx);
    if (idleTimer.current) {
      clearTimeout(idleTimer.current);
      idleTimer.current = null;
    }
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    let lastIndex = 0;

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top 80%',
      end: 'bottom 55%',
      scrub: true,
      onUpdate: (self) => {
        const idx = Math.min(
          MESSAGES.length - 1,
          Math.max(0, Math.floor(self.progress * MESSAGES.length)),
        );
        if (idx !== lastIndex) {
          lastIndex = idx;
          advance(idx);
        }
      },
    });

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          if (!idleTimer.current) {
            idleTimer.current = setTimeout(() => {
              idleTimer.current = null;
              advance((msgRef.current + 1) % MESSAGES.length);
            }, IDLE_MS);
          }
        } else if (idleTimer.current) {
          clearTimeout(idleTimer.current);
          idleTimer.current = null;
        }
      },
      { threshold: 0.25 },
    );

    observer.observe(el);

    return () => {
      st.kill();
      observer.disconnect();
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, []);

  return (
    <div ref={rootRef} className="flex w-full flex-col items-center justify-center gap-8">
      <TextFlippingBoard text={MESSAGES[msgIdx]} />
      <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink/40">
        Scroll through the board — every flake turns
      </p>
    </div>
  );
}
