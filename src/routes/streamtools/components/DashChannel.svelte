<script lang="ts">
  import { createEventDispatcher, getContext, afterUpdate } from "svelte";
  import { get } from "svelte/store";
  import { updateValue, storage, reloadDashboard } from "../params";
  import SvgIcon from "../../SVGIcon.svelte";

  let rotate: HTMLElement;

  let grid = getContext("grid");
  let group = getContext("group");
  let appDetails: appDetails = getContext("appDetails");

  function refresh() {
    reloadDashboard(appDetails.name, channelValue, "channel");
    rotate.animate([{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], { duration: 500, iterations: 1, easing: "ease-out" });
  }

  let channelValue = get(storage)[appDetails.name].inProgress.channel;

  let valueUpdate = (e: any) => {
    channelValue = e.target.value;
    updateValue(appDetails.name, channelValue, "channel");
  };
  // IF THE CHANNEL NAME does not equal the connected channel name show a rotation
  // Else show a tick.

  // Connect the input
  // Make the refresh button work
</script>

<section class:grid class:group>
  <h2>Channel Name</h2>
  <div>
    <span bind:this={rotate} on:click={refresh} on:keypress={refresh}><SvgIcon icon="refresh" fill="black" /></span>
    <input
      type="text"
      on:keypress={(e) => {
        if (e.key === "Enter") refresh();
      }}
      id="channel"
      value={$storage[appDetails.name].inProgress.channel}
      on:input={valueUpdate}
    />
  </div>
</section>

<style lang="scss">
  @use "../../../css/colours.scss" as *;

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

  h2 {
    color: $white;
    font-weight: bold;
    margin: 0;
    font-size: large;
    //padding-right: 1rem;
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
