<script lang="ts">
  import { createEventDispatcher, afterUpdate, getContext } from "svelte";
  import { hexToHSL } from "../../js/hexToHSL";

  import { slide } from "svelte/transition";

  import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@rgossiaux/svelte-headlessui";

  export let name: string | null = null;
  export let subtitle: string | null = null;
  export let id = "";
  export let type = "";
  export let min: string | null = null;
  export let max: string | null = null;
  export let ops: standardObject = {};
  export let value: any = null;
  export let faded = false;
  export let params: standardObject;
  const dispatch = createEventDispatcher();

  let grouped = getContext("grouped");
  let style: { opacity: number } = { opacity: 1 };
  let invert = false;
  let titleBlock = true;
  let dashInputValue: any;
  let optionName: string = "";

  let valueUpdate = (e: any) => {
    if (!e.target) {
      value = e.detail;
    } else {
      value = e.target.value;
    }
    if (type === "checkbox") value = e.target.checked;
    if (type === "color") {
      let hsl = hexToHSL(e.target.value);
      invert = false;
      if (hsl.l >= 70) invert = true;
    }
    dispatch("valueChange", { value: value, id: id });
  };

  let direction = "column";
  if (type === "select" && !subtitle) direction = "row";
  if (type === "color" && !value) value = "#ffffff";
  if (type === "checkbox") titleBlock = false;
  if (faded) style.opacity = 0.5;

  let rangeWidth = 0;

  afterUpdate(() => {
    if (!params) return;
    dashInputValue = params[id];
    if (type === "color" && dashInputValue) {
      value = dashInputValue;
      let hsl = hexToHSL(dashInputValue);
      invert = false;
      if (hsl.l >= 70) invert = true;
    }
    style.opacity = 1;
    if (faded) style.opacity = 0.5;
    if (type === "select") {
      optionName = Object.keys(ops).find((key) => ops[key] === dashInputValue) || "";
    }
    if (type === "range") {
      rangeWidth = dashInputValue;
      if (max === 10 || max === "10") rangeWidth = dashInputValue * 10;
      rangeWidth = rangeWidth * 0.94;
      console.log(rangeWidth);
    }
  });
</script>

<div class="inputBlock" class:grouped class:faded style:--flex={direction}>
  {#if titleBlock}
    <h2 class="inputName">{name}</h2>
    {#if subtitle}
      <p class="inputSubtitle">{subtitle}</p>
    {/if}
  {/if}
  {#if type === "select"}
    <Listbox value={dashInputValue ? dashInputValue : ops[Object.keys(ops)[0]]} on:change={valueUpdate} class="listBox" let:open>
      <ListboxButton class="listBoxButton {open ? 'boxOpen' : ''}">{dashInputValue ? optionName : Object.keys(ops)[0]}</ListboxButton>
      {#if open}
        <div class="optionHolder" transition:slide>
          <ListboxOptions class="listBoxOptions">
            {#each Object.keys(ops) as option (ops[option])}
              <ListboxOption class="listBoxOption" value={ops[option]} disabled={option === optionName} let:selected>
                <span class:listBoxSelected={selected}>
                  {option}
                </span>
              </ListboxOption>
            {/each}
          </ListboxOptions>
        </div>
      {/if}
    </Listbox>
  {:else if type === "color"}
    <div class="colourBlock">
      <p id="colourfontcolour" class:invert>{value}</p>
      <input {type} {id} value={dashInputValue || ""} on:input={valueUpdate} />
    </div>
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
  {:else if type === "range"}
    <p class="rangeValue" style="--width:{rangeWidth}%">{dashInputValue}</p>
    <input {type} {id} {min} {max} value={dashInputValue || ""} on:input={valueUpdate} />
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
      color: $white;
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

  .inputBlock {
    width: 85%;
  }

  div {
    position: relative;
    display: flex;
    flex-direction: var(--flex);
    padding: 0.2rem 0rem;
    align-items: baseline;
    width: calc(100% - 3rem);
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
    width: 90%;
    //margin-left: 5%;
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

  .colourBlock {
    display: flex;
    position: relative;
    width: 100%;
    height: calc(100% - 1.3rem);
    z-index: 2;
    justify-content: center;
    align-items: center;
    pointer-events: none;
    p {
      position: absolute;
      font-style: normal;
      font-weight: normal;
      color: white;
      padding: 0;
      margin: 0;
      text-transform: uppercase;
    }
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

  //RANGE
  input[type="range"] {
    appearance: none;
    height: 0.6rem !important;
    transition: opacity 0.2s;
    padding: 0.2rem !important;
    margin: 1rem 0rem;
    margin-top: 3rem;
    opacity: 1;
    cursor: pointer;
    width: 100%;
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
    position: relative;
    background: $white;
    cursor: pointer;
    transition: 0.2s all;
    margin: 0 !important;
    &:hover {
      box-shadow: 0px 0.2rem 5px $black;
      margin-bottom: 0.2rem;
    }
  }
  .rangeValue {
    color: $white;
    position: absolute;
    left: var(--width);
    width: 35px;
    height: 30px;
    padding-top: 5px;
    background-color: rgba(0, 0, 0, 0);
    border: 2px solid $colloquial;
    border-radius: 100%;
    bottom: 1.7rem;
    text-align: center;
    user-select: none;
    font-weight: bold;
    transition: all 0.4s cubic-bezier(0.53, 1.31, 0.15, 0.99);
    &:hover {
      transform: scale(1.1);
      background-color: $colloquial;
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

  //SELECT
  .buttonArrow {
    width: 1.4rem;
    color: $black;
    position: absolute;
  }
  :global(.listBox) {
    padding: 0.2rem 1rem;
    border: none;
    outline: none;
    font-family: "Poppins";
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: clamp(100%, 250px, 100%);
  }
  :global(.listBoxButton) {
    padding: 0.2rem 1rem;
    position: relative;
    width: 100%;
    max-width: 250px;
    border: none;
    outline: none;
    font-family: "Poppins";
    color: $black;
    font-weight: 500;
    cursor: pointer;
    border-radius: 0.2rem;
    border-width: 0px;
    border-color: fade-out($colloquial, 0.8) fade-out($colloquial, 0.9);
    border-style: solid;
    background: linear-gradient(0deg, fade-out($white, 0.5), white);
    background-size: 600% 600%;
    background-position: 50% 100%;
    padding: 1rem;
    margin-left: 1rem;
    //box-shadow: 0px 0px 5px darken($pink, 10);
    //margin-left: 16%;
    //margin-bottom: 0rem;
    border-radius: 1rem;
    z-index: 2;
    transition: all 0.4s ease-in-out !important;
    &:hover {
      border-color: white;
      //box-shadow: 0px 0px 2px darken($pink, 5);
      background-position: 50% 0%;
      //background: linear-gradient(0deg, red, pink);
    }
    position: relative;
    overflow: hidden;
    &::after {
      content: url("data:image/svg+xml, %3Csvg class='buttonArrow' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m11.125 16.313 7.688-7.688 3.594 3.719-11.094 11.063L0 12.094l3.5-3.531z' /%3E%3C/svg%3E%0A");
      display: block;
      position: absolute;
      transform: scale(0.5);
      top: 0;
      right: 0;
      opacity: 0.5;
      width: 50px;
      height: 50px;
    }
  }
  :global(.boxOpen) {
    //border-radius: 0;
  }
  :global(.listBoxOptions) {
    margin: 0;
    border-radius: 0 0 0.5rem 0.5rem;
    overflow: hidden;
    text-align: center;
    padding: 0;
    width: 80%;
    //margin-left: 1rem;
    //background-color: darken($white, 5);
    border: $colloquial 2px solid;
    border-top: 0px;
  }
  .optionHolder {
    padding: 0;
    position: relative;
    margin-left: 1rem;
    width: 100%;
    max-width: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  :global(.listBoxOption) {
    list-style-type: none;
    cursor: pointer;
    padding: 0.2rem 1rem;
    transition: 0.4s all ease-in-out;
    border-color: $black;
    &:nth-child(1) {
      border-width: 0px;
    }
    color: $white;
    border-color: fade-out($white, 0.9);
    border-width: 0.5px 0px 0px 0px;
    border-style: solid;
    border-radius: 0;
    &:hover {
      border-radius: 1rem;
      background-color: lighten($black, 3);
      //color: $black;
      font-weight: bold;
    }
  }
</style>
