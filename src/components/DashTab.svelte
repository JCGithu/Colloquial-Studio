<script lang="ts">
  import { RadioGroup, RadioGroupOption } from "@rgossiaux/svelte-headlessui";
  import { getContext, createEventDispatcher } from "svelte";
  import SvgIcon from "./SVGIcon.svelte";

  export let name = "";
  export let subtitle = "";
  export let fill = "white";
  export let id: string;
  export let options: Record<string, { value: any; icon: string; rotate?: number }>;
  export let value = options[0].value;
  export let center = false;
  export let customClass = "";

  export let faded = false;

  let grouped = getContext("grouped");
  let grid = getContext("grid");

  const dispatch = createEventDispatcher();
  $: {
    dispatch("change");
    let dudd = value;
  }
</script>

<div class="inputBlock {customClass}" class:grid class:grouped class:faded class:center>
  {#if name.length}
    <h2 class="inputName">{name}</h2>
  {/if}
  {#if subtitle.length}
    <p class="inputSubtitle">{subtitle}</p>
  {/if}
  <RadioGroup bind:value class="radioGroup" {id}>
    {#each Object.keys(options) as option}
      <span>
        <RadioGroupOption value={options[option].value} let:checked class="radioOption">
          <span class:TabChecked={checked} class:iconOption={options[option].icon}>
            {#if options[option].icon}
              <SvgIcon icon={options[option].icon} {fill} rotate={options[option].rotate} />
            {:else}
              {option}
            {/if}
          </span>
        </RadioGroupOption>
      </span>
    {/each}
  </RadioGroup>
</div>

<style lang="scss">
  @use "../css/default.scss" as d;
  @use "../css/colours.scss" as *;
  @import "../css/dashboard.scss";

  .center {
    display: flex;
    justify-content: center;
  }

  // .inputBlock {
  //   container-type: inline-size;
  // }

  :global(.radioGroup) {
    position: relative;
    //width: 100%;
    width: max-content;
    max-width: 100%;
    display: flex;
    justify-self: flex-end;
    justify-content: space-between;
    border: none;
    outline: none;
    font-family: "Poppins";
    color: $black;
    font-weight: 500;
    border-width: 0px;
    background-color: $whiteFade;
    //padding: 1rem;
    border-radius: 0.6rem;
    z-index: 2;
    //margin: 0.4rem 0;
    transition:
      all 0.4s ease-in-out,
      background 0.1s ease;
    position: relative;
    overflow: hidden;
    &:focus {
      background: white;
    }
  }
  :global(.radioOption) {
    cursor: pointer;
    padding: 0.5em;
    border-radius: 0.5em;
    margin: 0.2em;
    opacity: 0.7;
    background-color: rgba(black, 0.05);
    transition: all 0.2s;
    &:has(.TabChecked) {
      opacity: 1;
      background-color: rgba($colloquial, 0.5);
    }
  }

  .iconOption {
    height: 1.5em;
    max-height: 1.5em;
    position: relative;
    display: block;
  }
</style>
