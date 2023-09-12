<script lang="ts">
  import { getContext } from "svelte";

  //PROPS
  export let name: string;
  export let id: keyof streamToolCombined;
  export let subtitle = "";
  export let faded = false;
  export let value = "";
  export let customClass = "";
  //CONTEXT
  let grouped = getContext("grouped");
  let grid = getContext("grid");

  //Input Specific
  function colourCheck(H: any) {
    H = JSON.stringify(H).replaceAll('"', "");
    // Convert hex to RGB first
    let r = 0,
      g = 0,
      b = 0;
    if (H.length === 4) {
      r = parseInt("0x" + H[1] + H[1]);
      g = parseInt("0x" + H[2] + H[2]);
      b = parseInt("0x" + H[3] + H[3]);
    } else if (H.length === 7) {
      r = parseInt("0x" + H[1] + H[2]);
      g = parseInt("0x" + H[3] + H[4]);
      b = parseInt("0x" + H[5] + H[6]);
    }
    // Then to HSL
    r /= 255;
    g /= 255;
    b /= 255;
    let cmin = Math.min(r, g, b);
    let cmax = Math.max(r, g, b);
    let l = (cmax + cmin) / 2;
    l = +(l * 100).toFixed(1);

    return l >= 70;
  }
</script>

<div class="inputBlock inputBlockVert {customClass}" class:grid class:grouped class:faded style:--flex={"column"}>
  <h2 class="inputName">{name}</h2>
  {#if subtitle.length}
    <p class="inputSubtitle">{subtitle}</p>
  {/if}
  <div class="colourBlock">
    <label for={id} class:invert={colourCheck(value)}>{value}</label>
    <input type="color" {id} aria-label={id} bind:value />
  </div>
</div>

<style lang="scss">
  @use "../css/default.scss" as d;
  @use "../css/colours.scss" as *;
  @import "../css/dashboard.scss";

  .invert {
    color: black !important;
  }

  .colourBlock {
    display: flex;
    position: relative;
    width: 100%;
    height: calc(100% - 1.3rem);
    z-index: 2;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    background-color: transparent;
    label {
      position: absolute;
      font-style: normal;
      font-weight: normal;
      z-index: 2;
      color: white;
      padding: 0;
      padding-top: 0.1rem;
      margin: 0;
      pointer-events: none;
      text-transform: uppercase;
    }
    input {
      box-shadow: none !important;
      background-color: transparent;
      border: none !important;
      border-color: transparent;
    }
  }

  ::-webkit-color-swatch {
    border: none;
    border-radius: 10px;
    padding: 0;
    position: absolute;
    //background-color: transparent !important;
    left: -5%;
    top: -5%;
    width: 110%;
    height: 110%;
  }
  ::-webkit-color-swatch-wrapper {
    border: transparent;
    outline: none;
    position: relative;
    overflow: hidden;
    border-radius: 10px;
    background-color: transparent !important;
    padding: 0;
  }
  input[type="color"] {
    height: 4rem;
    padding: 0 !important;
    opacity: 1;
    cursor: pointer;
    width: 100%;
    &:focus {
      box-shadow: 0px 0px 2px rgba($white, 0.8) !important;
      &::-webkit-color-swatch-wrapper {
        border: solid $white 2px !important;
      }
    }
  }
</style>
