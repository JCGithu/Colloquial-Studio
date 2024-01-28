<script lang="ts">
  import { getContext } from "svelte";

  //PROPS
  export let name: string;
  export let id: keyof streamToolCombined;
  export let subtitle = "";
  export let faded = false;
  export let value = 0;
  export let center = false;
  export let customClass = "";
  //CONTEXT
  let grouped = getContext("grouped");
  let grid = getContext("grid");
</script>

<div class="inputBlock inputBlockVert {customClass}" class:grid class:grouped class:faded class:center style:--flex={"column"}>
  <h2 class="inputName">{name}</h2>
  {#if subtitle.length}
    <p class="inputSubtitle">{subtitle}</p>
  {/if}
  <input type="number" {id} aria-label={id} bind:value on:change />
</div>

<style lang="scss">
  @use "../css/default.scss" as d;
  @use "../css/colours.scss" as *;
  @use "../css/dashboard.scss";
  @use "../css/dashboardInputs.scss";

  input[type="number"] {
    padding-left: 1rem;
    margin-bottom: 0.5rem;
    height: 1.2rem;
    position: relative;
  }

  .center {
    text-align: center;
    display: flex;
    align-items: center;
    input {
      text-align: center;
      width: max-content;
      &:hover {
        font-weight: normal;
      }
      &::-webkit-inner-spin-button {
        appearance: none;
        cursor: pointer;
        pointer-events: none;
        display: block;
        width: 0px;
        color: rgb(248, 248, 248);
        text-align: center;
        position: relative;
      }
    }
  }
</style>
