<script lang="ts">
  import { DialogTitle } from "@rgossiaux/svelte-headlessui";
  import { getContext } from "svelte";
  import type { Writable } from "svelte/store";

  //PROPS
  export let name: string;
  export let id: keyof streamToolCombined;
  export let subtitle = "";
  export let faded = false;
  export let value = false;
  export let customClass = "";
  //CONTEXT
  let appDetails: appDetails = getContext("appDetails");
  let grouped = getContext("grouped");
  let grid = getContext("grid");
  const store = getContext("store") as Writable<streamToolTotalStorage>;

  function EnterFlip(e: KeyboardEvent) {
    console.log(e);
    if (e.key != "Enter") return;
    value = !value;
  }
</script>

<div class="inputBlock {customClass}" class:grid class:grouped class:faded class:longTitle={name.length > 15} on:keypress={EnterFlip} role="button" tabindex="0">
  <label style={subtitle ? "flex-direction: column" : ""} class="checkContainer">
    <div>
      <h2>{name}</h2>
      <input type="checkbox" {id} aria-label={id} bind:checked={value} on:change />
      <span class="checkmark" />
    </div>
    {#if subtitle}
      <p class="inputSubtitle">{subtitle}</p>
    {/if}
  </label>
</div>

<style lang="scss">
  @use "../css/default.scss" as d;
  @use "../css/colours.scss" as *;
  @use "../css/dashboard.scss";
  @use "../css/dashboardInputs.scss";

  //CHECKBOXES
  label {
    font-size: large;
    font-weight: bold;
    display: flex;
    position: relative;
    //padding: 0.2rem 0.1rem;
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
      border: $white solid 2px;
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
      background-color: fade-out($whiteFade, 0.5);
    }
    &:hover {
      input ~ span {
        background-color: fade-out($whiteFade, 0.5);
        //box-shadow: 0px 0px 3px $white inset;
      }
    }
    input:checked ~ span {
      //background-color: $colloquial;
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

  .inputBlock {
    grid-template-columns: 1fr;
  }
  @container (max-width: 250px) {
    .longTitle {
      h2 {
        font-size: 0.8rem;
      }
    }
    .inputSubtitle {
      font-size: 0.7rem;
    }
  }
</style>
