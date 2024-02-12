<script lang="ts">
  import { getContext, createEventDispatcher } from "svelte";
  import SvgIcon from "./SVGIcon.svelte";
  import tooltip from "../js/tooltip";

  export let name = "";
  export let subtitle = "";
  export let fill = "white";
  export let id = name;
  export let options: Record<string, { value: any; icon: string; rotate?: number }>;
  export let value = options[0].value;
  export let center = false;
  export let customClass = "";

  export let faded = false;

  let grouped = getContext("grouped");
  let grid = getContext("grid");

  const dispatch = createEventDispatcher();
  function onChange(e: Event) {
    dispatch("change");
    let target = e.currentTarget as HTMLInputElement;
    value = parseInt(target.value) ? parseInt(target.value) : target.value;
  }
</script>

<div class="inputBlock {customClass}" class:grid class:grouped class:faded class:center>
  {#if name.length}
    <h2 class="inputName">{name}</h2>
  {/if}
  {#if subtitle.length}
    <p class="inputSubtitle">{subtitle}</p>
  {/if}
  <div class="radioGroup" {id}>
    {#each Object.keys(options) as option}
      <span use:tooltip={options[option].icon ? option : null}>
        <label class="radioOption" class:TabChecked={options[option].value === value}>
          <input type="radio" {name} on:change={onChange} value={options[option].value} />
          <span class:iconOption={options[option].icon}>
            {#if options[option].icon}
              <SvgIcon icon={options[option].icon} {fill} rotate={options[option].rotate} />
            {:else}
              {option}
            {/if}
          </span>
        </label>
      </span>
    {/each}
  </div>
</div>

<style lang="scss">
  @use "../css/default.scss" as d;
  @use "../css/colours.scss" as *;
  @use "../css/dashboard.scss";

  .center {
    display: flex;
    justify-content: center;
  }

  input {
    visibility: hidden !important;
    height: 0 !important;
    width: 0 !important;
    position: absolute;
  }

  .radioGroup {
    position: relative;
    width: max-content;
    max-width: 100%;
    display: flex;
    justify-self: flex-end;
    justify-content: space-between;
    border: none;
    outline: none;
    padding: 1px;
    font-family: "Poppins";
    color: $black;
    font-weight: 500;
    border-width: 0px;
    background-color: $whiteFade;
    border-radius: 10px;
    z-index: 2;
    transition:
      all 0.4s ease-in-out,
      background 0.1s ease;
    position: relative;
    &:focus {
      background: white;
    }
  }
  .radioOption {
    display: block;
    cursor: pointer;
    padding: 0.5em;
    width: max-content;
    //width: 20px;
    height: 20px;
    border-radius: 8px;
    margin: 0.2em;
    opacity: 0.7;
    background-color: rgba(black, 0.05);
    transition: all 0.2s;
    span {
      user-select: none;
    }
    &.TabChecked {
      opacity: 1;
      background-color: rgba($colloquial, 0.5);
    }
  }

  .iconOption {
    height: 100%;
    max-height: 100%;
    position: relative;
    display: block;
  }
</style>
