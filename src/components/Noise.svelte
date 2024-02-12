<svg viewBox="0 0 500 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display: none;">
  <filter id="noiseFilter">
    <feTurbulence type="fractalNoise" baseFrequency=".65" numOctaves="2" stitchTiles="stitch" />
  </filter>
</svg>

<style>
  :global(.addNoise::after) {
    --noiseOpacity: 0.5;
    --noiseBlend: overlay;
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    filter: url(#noiseFilter);
    opacity: var(--noiseOpacity);
    mix-blend-mode: var(--noiseBlend);
    pointer-events: none;
    z-index: 1;
  }
</style>
