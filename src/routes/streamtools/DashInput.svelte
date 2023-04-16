<script lang="ts">
  import { storage, updateValue, urlBuild } from "./params";
  import { createEventDispatcher, afterUpdate, getContext, onMount } from "svelte";
  import { slide } from "svelte/transition";

  //CONTEXT
  let appDetails: appDetails = getContext("appDetails");

  import { hexToHSL } from "../../js/hexToHSL";
  import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@rgossiaux/svelte-headlessui";

  export let name: string | null = null;
  export let subtitle: string | null = null;
  export let id = "";
  export let type = "";
  export let min: number = 0;
  export let max: number = 100;
  export let ops: standardObject = {};
  export let value: any = null;
  export let faded = false;
  export let required = false;

  //export let params: standardObject;

  const dispatch = createEventDispatcher();

  let grouped = getContext("grouped");
  let grid = getContext("grid");
  let style: { opacity: number } = { opacity: 1 };
  let invert = false;
  let titleBlock = true;
  let dashInputValue: any;
  let optionName = Object.keys(ops).find((key) => ops[key] === $storage[appDetails.name]["inProgress"][id]) || "NA";

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
    console.log("====== INPUT CHANGE =========");
    updateValue(appDetails.name, value, id);
  };

  let direction = "column";
  let vert = true;
  if (type === "select" && !subtitle) {
    direction = "row";
    vert = false;
  }
  if (type === "color" && !value) value = "#ffffff";
  if (type === "checkbox") titleBlock = false;

  function scale(number: number, inMin: number, inMax: number, outMin: number, outMax: number) {
    return ((number - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
  }

  let rangeWidth = 0;

  afterUpdate(() => {
    style.opacity = 1;
    if (faded) style.opacity = 0.5;

    dashInputValue = $storage[appDetails.name]["inProgress"][id];
    if (type === "color" && dashInputValue) {
      value = dashInputValue;
      let hsl = hexToHSL(dashInputValue);
      invert = false;
      if (hsl.l >= 70) invert = true;
    }

    if (type === "select") optionName = Object.keys(ops).find((key) => ops[key] === dashInputValue) || "NA";
    if (type === "range") rangeWidth = scale(dashInputValue, min, max, 0, 1);
  });
  onMount(async () => {
    setTimeout(() => {
      if (type != "select") return;
      optionName = Object.keys(ops).find((key) => ops[key] === $storage[appDetails.name]["inProgress"][id]) || "NA";
    }, 500);
  });
</script>

<div class="inputBlock" class:inputBlockVert={vert} class:grid class:grouped class:faded style:--flex={direction}>
  {#if titleBlock}
    <h2 class="inputName {type === 'select' ? 'listName' : ''}" class:required>{name}</h2>
    {#if subtitle}
      <p class="inputSubtitle">{subtitle}</p>
    {/if}
  {/if}
  {#if type === "select"}
    <Listbox value={dashInputValue ? dashInputValue : ops[Object.keys(ops)[0]]} on:change={valueUpdate} class="listBox" let:open>
      <ListboxButton class="listBoxButton {open ? 'boxOpen' : ''}">{optionName}</ListboxButton>
      {#if open}
        <div class="optionHolder" transition:slide>
          <ListboxOptions class="listBoxOptions">
            {#each Object.keys(ops) as option (ops[option])}
              <ListboxOption value={ops[option]} disabled={option === optionName} class={({ active }) => (active ? "listBoxActive listBoxOption" : "listBoxOption")} let:selected>
                <span class:optionSelected={selected}>
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
      <label for={id} class:invert>{value}</label>
      <input {type} {id} aria-label={id} value={dashInputValue || ""} on:input={valueUpdate} />
    </div>
  {:else if type === "checkbox"}
    <label
      style={subtitle ? "flex-direction: column" : ""}
      class="checkContainer"
      on:keypress={(e) => {
        if (e.key === "Enter") updateValue(appDetails.name, !dashInputValue, id);
      }}
    >
      <div>
        <h2>{name}</h2>
        <input {type} {id} aria-label={id} checked={dashInputValue || false} on:change={valueUpdate} />
        <span class="checkmark" />
      </div>
      {#if subtitle}
        <p class="inputSubtitle">{subtitle}</p>
      {/if}
    </label>
  {:else if type === "range"}
    <p class="rangeValue" style="--width:{rangeWidth}">{dashInputValue}</p>
    <input {type} {id} {min} {max} aria-label={id} value={dashInputValue || ""} on:input={valueUpdate} />
  {:else}
    <input {type} {id} {min} {max} aria-label={id} value={dashInputValue || ""} on:input={valueUpdate} />
  {/if}
</div>

<style lang="scss">
  @use "../../css//default.scss" as d;
  @use "../../css/colours.scss" as *;

  .invert {
    color: black !important;
  }
  .faded {
    opacity: 0.5;
  }
  .required {
    &::after {
      content: "*";
      position: absolute;
      opacity: 0.7;
      font-weight: 400;
    }
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
      margin-bottom: 0.3rem;
      width: calc(100% - 1rem);
    }
  }

  h2 {
    color: $white;
    font-weight: bold;
    margin: 0;
    font-size: large;
    font-family: "Poppins";
    //padding-right: 1rem;
  }

  .listName {
    //align-items: baseline;
    padding-right: 1rem;
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
    width: calc(85% - 1rem);
    max-width: calc(85% - 1rem);
    padding: 0.5rem 0.5rem;
    margin: 0.15rem 0;
    &.grouped {
      width: calc(100% - 2rem);
      max-width: calc(100% - 2rem);
    }
    &.grid {
      width: calc(100% - 1rem);
      max-width: calc(100% - 1rem);
      padding: 0 0.5rem;
    }

    display: grid;
    grid-template-columns: 1fr 1fr;
    transition: background-color 0.3s ease-in-out;
    @media screen and (max-width: d.$phone) {
      grid-template-columns: 1fr;
    }
    border-radius: 1rem;
    &:hover {
      background-color: fade-out($white, 0.9);
    }
  }

  .inputBlockVert {
    grid-template-columns: 1fr;
  }

  div {
    position: relative;
    display: flex;
    flex-direction: var(--flex);
    padding: 0.2rem 0rem;
    margin-bottom: 0.5rem;
    margin-top: 0.2rem;
    align-items: center;
    width: calc(100% - 3rem);
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
    width: 90%;
    width: calc(100% - 3rem);
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

  input[type="text"] {
    margin-bottom: 0.5rem;
    height: 1.2rem;
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
    &:focus {
      box-shadow: 0px 0px 2px rgba($white, 0.8) !important;
      &::-webkit-color-swatch-wrapper {
        border: solid $white 2px !important;
      }
    }
  }

  //CHECKBOXES
  label {
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
      background-color: $whiteFade;
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
    input:focus + span {
      border: $white solid 2px !important;
      background-color: fade-out($whiteFade, 0.5);
    }
    &:hover {
      input ~ span {
        background-color: $white;
        //box-shadow: 0px 0px 3px $white inset;
      }
    }
    input:checked ~ span {
      background-color: $colloquial;
      justify-content: center;
      display: flex;
      align-content: center;
      box-shadow: inset 0px 0px 3px fade-out($white, 1);
      transition: box-shadow 0.2s ease-in-out;
      &:hover {
        box-shadow: inset 0px 0px 3px $white;
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
    transition: all 0.2s ease-in-out;
    padding: 0.2rem !important;
    margin: 1rem 0rem;
    //margin-top: 3rem;
    opacity: 1;
    cursor: pointer;
    width: 100%;
    background-color: darken($black, 5) !important;
    box-shadow: inset 0px 0px 10px fade-out($whiteFade, 1);
    &:hover {
      box-shadow: inset 0px 0px 10px fade-out($whiteFade, 0.9);
    }
  }
  ::-webkit-slider-runnable-track {
    margin: 0.2rem !important;
  }
  ::-webkit-slider-thumb {
    appearance: none;
    box-shadow: 0px 0px 0px black;
    width: 25px;
    height: 25px;
    border-radius: 100%;
    position: relative;
    background: $white;
    cursor: pointer;
    transition: 0.2s all;
    margin: 0 !important;
    border: 3px solid $white;
    &:hover {
      transform: scale(1.1);
      border-color: $colloquial;
      box-shadow: 0px 10px 10px black;
      margin-bottom: 0.2rem;
    }
    &:focus {
      background: $colloquial;
    }
  }
  .rangeValue {
    color: $white;
    position: relative;
    width: 35px;
    height: 30px;
    padding-top: 7px;
    margin: 0;
    margin-left: calc((100% - 35px) * var(--width));
    background-color: transparent;
    border: 2px solid $colloquial;
    border-radius: 100%;
    //bottom: 1.7rem;
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
      align-items: center;
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
  :global(.listBox) {
    padding: 0.5rem 0rem;
    border: none;
    outline: none;
    font-family: "Poppins";
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
  }
  :global(.listBoxButton) {
    position: relative;
    width: 100%;
    //max-width: 70%;
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
    background: linear-gradient(0deg, $whiteFade, $white);
    background-size: 600% 600%;
    background-position: 50% 100%;
    padding: 1rem;
    border-radius: 1rem;
    z-index: 2;
    transition: all 0.4s ease-in-out, background 0.1s ease;
    &:hover {
      border-color: white;
      background-position: 50% 0%;
      font-weight: bold;
    }
    position: relative;
    overflow: hidden;
    &::after {
      content: url("data:image/svg+xml, %3Csvg fill='#{$black}' viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m11.125 16.313 7.688-7.688 3.594 3.719-11.094 11.063L0 12.094l3.5-3.531z' /%3E%3C/svg%3E%0A");
      display: block;
      position: absolute;
      top: calc(50% - 12.5px);
      right: 0;
      opacity: 1;
      width: 25px;
      height: 25px;
    }
    &:focus {
      background: white;
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
    &:focus {
      outline: none;
    }
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
    @media screen and (max-width: d.$phone) {
      max-width: 100%;
    }
  }
  :global(.listBoxOption) {
    list-style-type: none;
    cursor: pointer;
    padding: 0.2rem 1rem;
    transition: 0.4s all ease-in-out;
    &:nth-child(1) {
      border-width: 0px;
    }
    color: $white;
    border-color: fade-out($white, 0.9);
    border-width: 0.5px 0px 0px 0px;
    border-style: solid;
    border-radius: 0;
    &:hover,
    &:focus {
      border-radius: 1rem;
      background-color: lighten($black, 3);
      //color: $black;
      font-weight: bold;
    }
  }
  :global(.listBoxActive) {
    border-radius: 1rem;
    background-color: lighten($black, 3);
    //color: $black;
    font-weight: bold;
  }
  .optionSelected {
    font-weight: bold;
    //color: $colloquial;
    text-decoration: underline;
    text-decoration-color: $colloquial;
  }
</style>
