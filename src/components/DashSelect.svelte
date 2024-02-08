<script lang="ts">
  import { getContext, createEventDispatcher } from "svelte";
  import { slide } from "svelte/transition";

  export let name: string;
  export let subtitle = "";
  export let id = name;
  export let options: Record<string, any>;
  export let value: any;
  export let faded = false;
  export let customClass = "";

  let open = false;

  let grouped = getContext("grouped");
  let grid = getContext("grid");
  $: currentName = Object.keys(options).find((key) => options[key] === value);
  const dispatch = createEventDispatcher();

  function keyPress(e: { key: string }) {
    if (e.key === "Enter") {
      console.log("wow");
    }
  }
  function changeValue(name: string) {
    value = options[name];
    open = false;
    dispatch("change");
  }
</script>

<div {id} class="inputBlock {customClass} inputBlockSelect" class:grid class:grouped class:faded style:--flex={"row"}>
  <h2 class="inputName listName">{name}</h2>
  {#if subtitle}
    <p class="inputSubtitle">{subtitle}</p>
  {/if}
  <div class="listBox">
    <button class="listBoxButton" class:boxOpen={open} on:click={() => (open = !open)}>{currentName}</button>
    {#if open}
      <div class="optionHolder" transition:slide>
        {#each Object.keys(options) as option}
          <div role="button" tabindex="0" class="listBoxOption" on:click={() => changeValue(option)} on:keypress={() => keyPress}>
            <span>
              {option}
            </span>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @use "../css/default.scss" as d;
  @use "../css/colours.scss" as *;
  @use "../css/dashboard.scss";

  //SELECT
  .listBox {
    padding: 0.5rem 0rem;
    border: none;
    outline: none;
    font-family: "Poppins";
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    width: 100%;
  }
  .listBoxButton {
    position: relative;
    width: 100%;
    outline: none;
    font-family: "Poppins";
    color: $black;
    text-align: left;
    font-weight: 500;
    cursor: pointer;
    border-width: 0px;
    border-style: solid;
    border-color: transparent;
    background: linear-gradient(0deg, $whiteFade, $white);
    background-size: 600% 600%;
    background-position: 50% 100%;
    padding: 1rem;
    border-radius: 1rem;
    z-index: 2;
    overflow: hidden;
    transition:
      all 0.4s ease-in-out,
      background 0.1s ease;
    &:hover {
      border-color: white;
      background-position: 50% 0%;
      font-weight: bold;
    }

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
  .boxOpen {
    // Just to keep this without a warning
    position: relative;
  }
  .listBoxOptions {
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
    //margin-left: 1rem;
    margin-right: 5%;
    margin-top: -1%;
    padding-top: 1%;
    width: 89%;
    max-width: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border: $whiteFade 2px solid;
    border-top: none;
    border-radius: 0 0 0.5rem 0.5rem;
    @media screen and (max-width: d.$phone) {
      max-width: 100%;
    }
  }
  .listBoxOption {
    list-style-type: none;
    cursor: pointer;
    width: calc(89% - 0.4rem);
    padding: 0.4rem 1rem;
    font-size: 0.9rem !important;
    margin: 0;
    transition: 0.4s all ease-in-out;
    &:nth-child(1) {
      border-width: 0px;
    }
    &:last-child {
      padding-bottom: 0.6rem;
    }
    color: $white;
    border-color: fade-out($white, 0.9);
    border-width: 0.5px 0px 0px 0px;
    border-style: solid;
    border-radius: 0;
    &:hover,
    &:focus {
      background-color: $black;
    }
  }
  .listBoxActive {
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
  .grouped {
    .listBox {
      .listBoxButton {
        border-radius: 8px;
      }
    }
  }
</style>
