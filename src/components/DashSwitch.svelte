<script lang="ts">
  import { getContext, createEventDispatcher } from "svelte";

  //PROPS
  export let name: string;
  export let id = name;
  export let subtitle = "";
  export let faded = false;
  export let value = false;
  export let center = false;
  export let customClass = "";
  //CONTEXT
  let grouped = getContext("grouped");
  let grid = getContext("grid");

  const dispatch = createEventDispatcher();

  function toggleButton() {
    value = !value;
    dispatch("change");
  }
</script>

<div class="inputBlock inputBlockVert {customClass}" class:grid class:grouped class:faded class:center style:--flex={"column"}>
  <h2 class="inputName">{name}</h2>
  {#if subtitle.length}
    <p class="inputSubtitle">{subtitle}</p>
  {/if}
  <button on:click={toggleButton} on:submit={toggleButton} class:switchEnabled={value} {id}>
    <span class:toggleOn={value} />
  </button>
</div>

<style lang="scss">
  @use "../css/default.scss" as d;
  @use "../css/colours.scss" as *;
  @import "../css/dashboard.scss";

  button {
    position: relative;
    display: inline-flex;
    align-items: center;
    border-radius: 9999px;
    border-width: 0px;
    height: 1.5rem;
    width: 2.75rem;
    cursor: pointer;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    background-color: var(--settingsDetail);
  }

  .switchEnabled {
    background-color: $twordlePurple;
  }

  .center {
    display: flex;
    align-items: center;
  }

  span {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    background-color: $white;
    border-radius: 9999px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    transform: translateX(-0.25rem);
  }

  .toggleOn {
    transform: translateX(1.1rem);
  }
</style>
