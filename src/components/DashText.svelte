<script lang="ts">
  import { getContext } from "svelte";
  //CONTEXT
  let grouped = getContext("grouped");
  let grid = getContext("grid");

  //PROPS
  export let name: string;
  export let id: string;
  export let subtitle = "";
  export let faded = false;
  export let value: string;
  export let customClass = "";
</script>

<div class="inputBlock inputBlockVert {customClass}" class:grid class:grouped class:faded style:--flex={"column"}>
  <h2 class="inputName">{name}</h2>
  {#if subtitle.length}
    <p class="inputSubtitle">{subtitle}</p>
  {/if}
  <input type="text" {id} aria-label={id} bind:value />
</div>

<style lang="scss">
  @use "../css/default.scss" as d;
  @use "../css/colours.scss" as *;
  @import "../css/dashboard.scss";

  input[type="text"] {
    padding-left: 1rem;
    margin-bottom: 0.5rem;
    height: 1.2rem;
  }
</style>
