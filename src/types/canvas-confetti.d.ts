declare module 'canvas-confetti' {
  interface Options {
    particleCount?: number;
    angle?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    disableForReducedMotion?: boolean;
  }

  function confetti(options?: Options): void;
  export default confetti;
}
