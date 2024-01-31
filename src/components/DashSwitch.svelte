<script lang="ts">
  import { getContext, createEventDispatcher } from "svelte";
  import { Switch } from "@rgossiaux/svelte-headlessui";

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
  $: {
    dispatch("change");
    let dudd = value;
  }
</script>

<div class="inputBlock inputBlockVert {customClass}" class:grid class:grouped class:faded class:center style:--flex={"column"}>
  <h2 class="inputName">{name}</h2>
  {#if subtitle.length}
    <p class="inputSubtitle">{subtitle}</p>
  {/if}
  <Switch bind:checked={value} class={value ? "switch switch-enabled" : "switch switch-disabled"} {id}>
    <span class="sr-only">Enable notifications</span>
    <span class="toggle {value ? 'toggle-on' : 'toggle-off'}" />
  </Switch>
</div>

<style lang="scss">
  @use "../css/default.scss" as d;
  @use "../css/colours.scss" as *;
  @import "../css/dashboard.scss";

  :global(.switch) {
    position: relative;
    display: inline-flex;
    align-items: center;
    border-radius: 9999px;
    border-width: 0px;
    height: 1.5rem;
    width: 2.75rem;
    cursor: pointer;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(.switch-enabled) {
    background-color: $twordlePurple;
  }

  :global(.switch-disabled) {
    background-color: var(--settingsDetail);
  }

  .center {
    display: flex;
    align-items: center;
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .toggle {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    background-color: $white;
    border-radius: 9999px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .toggle-on {
    transform: translateX(1.1rem);
  }

  .toggle-off {
    transform: translateX(-0.25rem);
  }
</style>
