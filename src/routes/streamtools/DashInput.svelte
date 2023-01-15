<script lang="ts">
  import { createEventDispatcher, afterUpdate, getContext } from "svelte";
  import { hexToHSL } from "../../js/hexToHSL";

  export let name: string | null = null;
  export let subtitle: string | null = null;
  export let id = "";
  export let type = "";
  export let min: string | null = null;
  export let max: string | null = null;
  interface Option {
    value: string;
    name: string;
  }
  export let ops: Array<Option> = [];
  export let value: any = null;
  export let faded = false;
  export let params: object;
  const dispatch = createEventDispatcher();

  let grouped = getContext("grouped");
  let style: { opacity: number } = { opacity: 1 };
  let invert = false;
  let titleBlock = true;
  let dashInputValue: any = "";

  let valueUpdate = (e) => {
    value = e.target.value;
    if (type === "checkbox") value = e.target.checked;
    if (type === "color") {
      let hsl = hexToHSL(e.target.value);
      invert = false;
      if (hsl.l >= 70) invert = true;
    }
    dispatch("valueChange", { value: value, id: id });
  };

  //if (grouped) style.width = "100%";
  let direction = "column";
  if (type === "select" && !subtitle) direction = "row";
  if (type === "color" && !value) value = "#ffffff";
  if (type === "checkbox") titleBlock = false;
  if (faded) style.opacity = 0.5;
  //let styleString = style.stringify();

  afterUpdate(() => {
    if (!params) return;
    dashInputValue = params[id];
    if (type === "color" && dashInputValue) {
      value = dashInputValue;
      let hsl = hexToHSL(dashInputValue);
      invert = false;
      if (hsl.l >= 70) invert = true;
    }
    if (faded) {
      style.opacity = 0.5;
    } else {
      style.opacity = 1;
    }
    //stringStyle = style.stringify();
  });
</script>

<div class:grouped class:faded style:--flex={direction}>
  {#if titleBlock}
    <h2 class="inputName">{name}</h2>
    {#if subtitle}
      <p class="inputSubtitle">{subtitle}</p>
    {/if}
  {/if}
  {#if type === "select"}
    <select {id} value={dashInputValue ? dashInputValue : ops[0].value} on:input={valueUpdate}>
      {#each ops as op}
        <option value={op.value}>{op.name}</option>
      {/each}
    </select>
  {:else if type === "color"}
    <div class="colourBlock"><p id="colourfontcolour" class:invert>{value}</p></div>
    <input {type} {id} value={dashInputValue || ""} on:input={valueUpdate} />
  {:else if type === "checkbox"}
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label style={subtitle ? "flex-direction: column" : ""} class="checkContainer">
      <div>
        <h2>{name}</h2>
        <input {type} {id} checked={dashInputValue || false} on:change={valueUpdate} />
        <span class="checkmark" />
      </div>
      {#if subtitle}
        <p class="inputSubtitle">{subtitle}</p>
      {/if}
    </label>
  {:else}
    <input {type} {id} {min} {max} value={dashInputValue || ""} on:input={valueUpdate} />
  {/if}
</div>

<style lang="scss">
  @import "../../css/colours.scss";
  .invert {
    color: black !important;
  }
  .faded {
    opacity: 0.5;
  }
  .grouped {
    display: flex;
    flex-direction: var(--flex);
    .inputSubtitle {
      color: $black;
    }
    input[type="text"],
    input[type="number"] {
      padding: 1rem 0rem 1rem 1rem;
      width: calc(100% - 1rem);
    }
    label input:checked ~ span {
      background-color: $black;
    }
  }

  $titles: $white;

  h2 {
    color: $titles;
    font-weight: bold;
    margin: 0;
    font-size: large;
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
    display: flex;
    flex-direction: var(--flex);
    padding: 0.2rem 0rem;
    align-items: baseline;
    width: calc(100% - 3rem);
    .colourBlock {
      display: flex;
      position: absolute;
      width: 100%;
      height: calc(100% - 1.3rem);
      margin-top: 1.65rem;
      z-index: 2;
      justify-content: center;
      align-items: center;
      pointer-events: none;
      p {
        font-style: normal;
        font-weight: normal;
        color: white;
        padding: 0;
        margin-top: 0rem;
        text-transform: uppercase;
      }
    }
  }

  input {
    padding: 1rem 1.5rem;
    margin-top: 0.2rem;
    border-radius: 1rem;
    border: none;
    font-family: "Poppins";
    background-color: $white !important;
    background: white;
    color: $black;
    width: 100%;
    transition: all 1s;
    opacity: 0.7;
    &:focus {
      outline: none;
      color: black;
      background-color: fade-out($deepBlue, 0.5) !important;
      background-color: $white !important;
      opacity: 1;
    }
    &:hover {
      opacity: 1;
    }
    box-shadow: inset 0px 0px 0px -60px lighten($pink, 10);
  }
  ::-webkit-color-swatch {
    border: none;
    border-radius: 10px;
    padding: 0;
  }
  ::-webkit-color-swatch-wrapper {
    border: none;
    border-radius: 10px;
    padding: 0;
  }
  input[type="color"] {
    height: 3rem;
    padding: 0 !important;
    opacity: 1;
    cursor: pointer;
  }
  input[type="text"],
  input[type="number"] {
    &:focus {
      box-shadow: inset 0px -207px 0px -200px $black;
    }
  }

  //CHECKBOXES
  label {
    color: $deepBlue;
    font-size: large;
    font-weight: bold;
    display: flex;
    position: relative;
    padding: 0.2rem 0.1rem;
    user-select: none;
    cursor: pointer;
    input {
      position: absolute;
      opacity: 0;
      cursor: pointer;
      height: 0;
      width: 0;
    }
    span {
      position: relative;
      padding: 0rem 1rem;
      margin: 0 0.5rem;
      background-color: fade-out($white, 0.2);
      border-radius: 0.3rem;
      transition: 0.2s all;
      &:after {
        content: "✔";
        position: absolute;
        display: none;
        border: $white;
        color: $white;
        border-width: 0 0.2rem 0.2rem 0;
      }
    }
    &:hover {
      input ~ span {
        background-color: $white;
        //box-shadow: 0px 0px 3px $white inset;
      }
    }
    input:checked ~ span {
      background-color: $pink;
      justify-content: center;
      display: flex;
      align-content: center;
      opacity: 0.8;
      &:hover {
        opacity: 1;
      }
      &:after {
        display: flex;
        align-self: center;
        justify-self: center;
      }
    }
  }

  select {
    margin: 0.4rem 1rem;
    padding: 0.5rem 0.5rem;
    border-radius: 0.5rem;
    border: none;
    background-color: $white;
    opacity: 0.7;
    transition: 0.3s all;
    color: $black;
    cursor: pointer;
    overflow-y: scroll;
    font-family: "Poppins";
    font-size: 1rem;
    outline: none !important;
    &:hover {
      opacity: 1;
      background-color: #008080;
      color: $white;
    }
    &:focus {
      outline: none;
    }
  }

  //RANGE
  input[type="range"] {
    appearance: none;
    height: 0.6rem !important;
    transition: opacity 0.2s;
    padding: 0.2rem !important;
    margin: 1rem 0rem;
    opacity: 1;
    cursor: pointer;
    background-color: darken($black, 5) !important;
  }
  ::-webkit-slider-runnable-track {
    margin: 0.2rem !important;
  }
  ::-webkit-slider-thumb {
    appearance: none;
    box-shadow: 0px 0px 0px $white;
    width: 25px;
    height: 25px;
    border-radius: 100%;
    background: $white;
    cursor: pointer;
    transition: 0.2s all;
    margin-bottom: 0;
    &:hover {
      box-shadow: 0px 0.2rem 5px $black;
      margin-bottom: 0.2rem;
    }
  }

  //GROUPING

  //CHECKMARKS
  .checkContainer {
    width: 100%;
    div {
      width: 100%;
      flex-direction: row;
      align-items: initial;
      justify-content: space-between;
    }
    span {
      max-height: 2rem;
      height: 2rem;
      justify-content: end;
      align-self: center;
    }
    p {
      margin: 0;
      font-weight: normal;
      padding: 0;
    }
  }
</style>
