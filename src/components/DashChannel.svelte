<script lang="ts">
  import { getContext, createEventDispatcher, afterUpdate, setContext } from "svelte";

  //PROPS
  export let name = "Channel Name";
  export let id = "channel";
  export let subtitle = "";
  export let faded = false;
  export let value = "";
  export let center = false;
  export let placeholder = "";
  export let customClass = "";
  //CONTEXT
  let group = getContext("grouped");
  let grid = getContext("grid");

  const dispatch = createEventDispatcher();

  import SvgIcon from "./SVGIcon.svelte";
  import tooltip from "../js/tooltip";

  let rotate: HTMLElement;

  function refresh() {
    dispatch("refresh");
    rotate.animate([{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], { duration: 500, iterations: 1, easing: "ease-out" });
  }
</script>

<section class={customClass} class:grid class:group class:faded class:center>
  <h2>{name}</h2>
  {#if subtitle}
    <p class="inputSubtitle">{subtitle}</p>
  {/if}
  <div>
    <input
      type="text"
      {placeholder}
      on:keypress={(e) => {
        if (e.key === "Enter") refresh();
      }}
      {id}
      bind:value
    />
    <span use:tooltip={"Reload"} on:click={refresh} on:keypress={refresh} role="button" tabindex="0">
      <div bind:this={rotate} class="reloadButton">
        <SvgIcon icon="refresh" fill="black" />
      </div>
    </span>
  </div>
</section>

<style lang="scss">
  @use "../css/colours.scss" as *;

  section {
    position: relative;
    width: calc(85% - 1rem);
    max-width: calc(85% - 1rem);
    padding: 0.2rem 0.5rem;
    margin: 0.15rem 0;
    &.group {
      width: calc(100% - 2rem);
      max-width: calc(100% - 2rem);
    }
    &.grid {
      width: calc(100% - 1rem);
      max-width: calc(100% - 1rem);
      padding: 0 0.5rem;
    }
    //
    display: grid;
    grid-template-columns: 1fr;
    //
    transition: background-color 0.3s ease-in-out;
    border-radius: 1rem;
    &:hover {
      background-color: fade-out($white, 0.9);
    }
  }

  .center {
    text-align: center;
  }

  h2 {
    color: $white;
    font-weight: bold;
    margin: 0;
    font-size: large;
    font-family: "Poppins";
  }

  .inputSubtitle {
    color: $white;
    font-size: 1rem;
    font-style: italic;
    line-height: initial;
    vertical-align: text-bottom;
    margin: 0.35em 0;
  }

  div {
    position: relative;
    width: 100%;
    height: 3rem;
    margin-bottom: 0.5rem;
    margin-top: 0.2rem;
  }

  span {
    position: absolute;
    height: 1.5rem;
    right: 1rem;
    top: calc(1.6rem - 0.75rem);
    cursor: pointer;
  }

  .reloadButton {
    height: 100%;
    margin: 0;
  }

  input {
    height: 1.2rem;
    padding: 1rem 3.5rem 1rem 1.5rem;

    border-radius: 1rem;
    border: none;
    font-family: "Poppins";
    background-color: $whiteFade !important;
    color: $black;
    width: calc(100% - 5rem);
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
    }
    &:-internal-autofill-selected,
    &:focus {
      background-color: $whiteFade !important;
    }
  }
  input:-webkit-autofill,
  input:-webkit-autofill:hover,
  input:-webkit-autofill:focus,
  input:-webkit-autofill:active {
    transition: background-color 5000s ease-in-out 0s;
    background-color: $whiteFade !important;
  }
</style>
