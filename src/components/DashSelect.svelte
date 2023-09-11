<script lang="ts">
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";
  import { slide } from "svelte/transition";
  import { Listbox, ListboxButton, ListboxOptions, ListboxOption } from "@rgossiaux/svelte-headlessui";

  const store = getContext("store") as Writable<streamToolTotalStorage>;
  let appDetails: appDetails = getContext("appDetails");

  export let name: string;
  export let subtitle = "";
  export let id: string;
  export let options: Record<string, any>;
  export let value = options[0];
  export let faded = false;
  export let customClass = "";

  let grouped = getContext("grouped");
  let grid = getContext("grid");
  $: currentValue = Object.keys(options).find((key) => options[key] === value) || "";
</script>

<div class="inputBlock {customClass} inputBlockSelect" class:grid class:grouped class:faded style:--flex={"row"}>
  <h2 class="inputName listName">{name}</h2>
  {#if subtitle}
    <p class="inputSubtitle">{subtitle}</p>
  {/if}
  <Listbox bind:value class="listBox" let:open {id}>
    <ListboxButton class="listBoxButton {open ? 'boxOpen' : ''}">{currentValue}</ListboxButton>
    {#if open}
      <div class="optionHolder" transition:slide>
        <ListboxOptions class="listBoxOptions">
          {#each Object.keys(options) as option}
            <ListboxOption value={options[option]} disabled={options[option] === value} class={({ active }) => (active ? "listBoxActive listBoxOption" : "listBoxOption")} let:selected>
              <span class:optionSelected={selected}>
                {option}
              </span>
            </ListboxOption>
          {/each}
        </ListboxOptions>
      </div>
    {/if}
  </Listbox>
</div>

<style lang="scss">
  @use "../css/default.scss" as d;
  @use "../css/colours.scss" as *;
  @import "../css/dashboard.scss";

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
    // Just to keep this without a warning
    position: relative;
  }
  :global(.listBoxOptions) {
    margin: 0;
    margin-top: -1rem;
    border-radius: 0 0 0.5rem 0.5rem;
    overflow: hidden;
    text-align: center;
    padding: 0;
    width: 80%;
    max-height: 10rem;
    overflow-y: auto;
    &::-webkit-scrollbar {
      visibility: hidden;
      width: 0px !important;
    }
    border: $colloquial 2px solid;
    border-top: 0px;
    &:focus {
      outline: none;
    }
    &:nth-child(1) {
      padding-top: 1rem;
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
