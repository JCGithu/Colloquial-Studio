<script lang="ts">
  import { getContext } from "svelte";

  //PROPS
  export let name: string;
  export let id = name;
  export let subtitle = "";
  export let faded = false;
  export let center = false;
  export let thumb = "";
  export let customClass = "";

  //Input Specific
  export let min: number;
  export let max: number;
  export let step = 1;
  export let value = min;

  //CONTEXT
  let grouped = getContext("grouped");
  let grid = getContext("grid");

  function scale(number: number, inMin: number, inMax: number, outMin: number, outMax: number) {
    return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  let rangeWidth = 0;

  $: rangeWidth = scale(value, min, max, 0, 1);
</script>

<div class="inputBlock inputBlockVert {customClass}" class:grid class:grouped class:faded class:center style:--flex={"column"} style:--thumb={thumb}>
  <h2 class="inputName">{name}</h2>
  {#if subtitle}
    <p class="inputSubtitle">{subtitle}</p>
  {/if}
  <p class="rangeValue" style="--width:{rangeWidth}">{value}</p>
  <input type="range" {id} {min} {max} {step} aria-label={id} bind:value on:change />
</div>

<style lang="scss">
  @use "../css/default.scss" as d;
  @use "../css/colours.scss" as *;
  @use "../css/dashboard.scss";
  @use "../css/dashboardInputs.scss";

  div {
    position: relative;
    display: flex;
    flex-direction: var(--flex);
    padding: 0.2rem 0rem;
    margin-bottom: 0.5rem;
    margin-top: 0.2rem;
    align-items: center;
    width: calc(100% - 3rem);
    --thumbLine: #{$white};
    --thumbLineHover: #{$white};
  }

  input {
    padding: 1rem 1.5rem;
    margin-top: 0.2rem;
    border-radius: 1rem;
    border: none;
    font-family: "Poppins";
    background-color: $whiteFade;
    //background: white;
    color: $black;
    //margin-left: 5%;
    box-shadow: inset 0px 0px 10px rgba(256, 256, 256, 0);
    transition: all 1s;
    &:focus {
      outline: none;
      color: black;
      background-color: $white !important;
      box-shadow: inset 0px 0px 10px rgba(256, 256, 256, 0);
    }
    &:hover {
      background-color: $whiteFade;
      box-shadow: inset 0px 0px 10px rgba(256, 256, 256, 0.5);
      font-weight: bold;
    }
  }

  .center {
    text-align: center;
  }
  .faded {
    opacity: 0.6;
  }

  //RANGE
  input[type="range"] {
    appearance: none;
    height: 0.6rem !important;
    transition: all 0.2s ease-in-out;
    padding: 3px !important;
    margin: 1rem 0rem;
    //margin-top: 3rem;
    opacity: 1;
    cursor: pointer;
    width: calc(100% - 6px);
    background-color: darken($black, 5) !important;
    box-shadow: inset 0px 0px 10px fade-out($whiteFade, 1);
    &:hover {
      box-shadow: inset 0px 0px 10px fade-out($whiteFade, 0.9);
    }
  }
  ::-webkit-slider-runnable-track {
    margin: 3px !important;
  }
  ::-webkit-slider-thumb {
    appearance: none;
    box-shadow: 0px 0px 0px black;
    width: 35px;
    height: 35px;
    border-radius: 100%;
    position: relative;
    cursor: pointer;
    transition: 0.2s all;
    margin: 0 !important;
    border: 3px solid;
    border-color: var(--thumbLine);
    background-color: var(--thumb);
    &:hover {
      transform: scale(1.1);
      border-color: var(--thumbLineHover);
      box-shadow: 0px 10px 10px black;
      margin-bottom: 0.2rem;
    }
    &:focus {
      background: $colloquial;
    }
  }
  .rangeValue {
    color: $white;
    position: absolute;
    width: 35px;
    height: 28px;
    padding-top: 7px;
    margin: 0;
    left: 0px;
    z-index: 1;
    margin-top: 26px;
    // padding for the whole section is 8px each side
    // padding for the input is 6px each side
    margin-left: calc((100% - 28px - 35px) * var(--width) + 8px + 6px);
    border-radius: 100%;
    text-align: center;
    user-select: none;
    pointer-events: none;
  }
</style>
