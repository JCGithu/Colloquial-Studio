<script lang="ts">
  //import collapse from "svelte-collapse";
  import collapse from "../js/collapse";
  import { setContext } from "svelte";
  import { fly, slide } from "svelte/transition";
  import Dash from "./DashExport";
  setContext("grouped", true);

  let opened = false;
  export let title: string;
  export let customClass = "";
</script>

<div in:fly={{ x: 200, duration: 500 }} out:slide class="groupBox {customClass}" class:groupBoxOpen={opened}>
  <button type="button" class:opened title="Click to show options" on:click={() => (opened = !opened)}>{title}</button>
  <div class="group" class:groupOpen={opened} class:groupShut={!opened} use:collapse={{ open: opened }}>
    <slot {Dash} />
  </div>
  <div class:buffer={!opened} />
</div>

<style lang="scss">
  @use "../css/colours.scss" as *;

  button {
    appearance: none;
    background: none;
    font-family: "Poppins";
    font-weight: bold;

    --shadow-color: 0deg 0% 5%;
    width: 100%;
    font-size: clamp(15px, 2vw, 22px);
    cursor: pointer;
    text-align: left;
    position: relative;
    color: $white;
    border-color: lighten($colloquial, 10) $colloquial;
    border-style: solid;

    padding: 1rem;
    padding-right: 40px;
    margin: 0;
    text-decoration: underline;
    text-decoration-thickness: 3px;
    text-decoration-color: rgba(0, 0, 0, 0);
    border-width: 0;
    border-radius: 1rem;
    z-index: 2;
    position: relative;
    z-index: 0;
    transform-style: preserve-3d;
    filter: saturate(1);
    transition:
      all 0.15s cubic-bezier(0.71, 0.7, 0.41, 1.14) 0s,
      background-position 0.5s ease-in-out,
      background-size 0.5s ease-in-out !important;
    &:hover {
      text-decoration-color: $white;
    }
    &::after {
      content: url("data:image/svg+xml, %3Csvg fill='#{$white}' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m11.125 16.313 7.688-7.688 3.594 3.719-11.094 11.063L0 12.094l3.5-3.531z' /%3E%3C/svg%3E%0A");
      display: block;
      position: absolute;
      top: calc(50% - 12.5px);
      right: 0.5rem;
      opacity: 1;
      width: 25px;
      height: 25px;
      transition: opacity 0.3s ease-in-out;
    }
  }

  .opened {
    &::after {
      opacity: 0.1;
    }
  }

  .group {
    padding-top: 1.5rem;
    padding-bottom: 3rem;
    border-radius: 1rem;
    width: 100%;
    margin-top: -2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    visibility: hidden;
    border: 0px solid black;
    transition: 0.35s cubic-bezier(0.71, 0.7, 0.41, 1) 0s !important;
    container-type: inline-size;
  }

  @container (max-width: 250px) {
    :global(.inputBlockSelect) {
      grid-template-columns: 1fr !important;
      :global(.listBoxOptions) {
        max-height: max-content;
      }
    }
  }

  .groupOpen {
    visibility: visible;
    padding-bottom: 1rem;
  }

  @keyframes visible {
    from {
      visibility: visible;
    }
    to {
      visibility: hidden;
    }
  }

  .groupShut {
    padding-top: 0rem !important;
    padding-bottom: 0rem !important;
    animation: visible 1ms linear 0.4s;
  }

  .buffer {
    margin-bottom: 2rem;
  }

  .groupBox {
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(85% - 6px);
    background-color: var(--userBackground);

    border-radius: 1rem;
    margin: 1rem 0;
    flex-direction: column;
    border: fade-out($whiteFade, 0.6) solid;
    border-width: 3px 3px 5px 3px;
    text-decoration-color: transparent;
    box-shadow:
      0.2px 0.4px 0.5px hsl(var(--shadow-color) / 0.43),
      0.7px 1.2px 1.5px -0.9px hsl(var(--shadow-color) / 0.41),
      1.8px 3.1px 3.9px -1.8px hsl(var(--shadow-color) / 0.39),
      4.5px 7.8px 9.8px -2.7px hsl(var(--shadow-color) / 0.37);
    transition: transform box-shadow text-decoration-color 0.15s cubic-bezier(0.71, 0.7, 0.41, 1.14) 0s;
    cursor: pointer;
    &:hover {
      transform: scale(1.01);
      box-shadow: 5px 5px 15px rgba(0, 0, 0, 0.6);
      text-decoration-color: $white;
    }
  }

  .groupBoxOpen {
    margin: 1rem 0rem;
  }
</style>
