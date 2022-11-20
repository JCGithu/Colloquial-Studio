<script>
  import collapse from "svelte-collapse";
  let opening = false;
  export let title = "";
  export let inner = null;

  import { fly, slide } from "svelte/transition";

  function runClick() {
    opening = !opening;
  }
</script>

<div in:fly={{ x: 200, duration: 500 }} out:slide class={inner ? "inner groupBox" : "groupBox"}>
  <h2 class={opening ? "collapse opened" : "collapse"} title="click" on:click={runClick}>{title}</h2>
  <div class={opening ? "group" : "group groupShut"} use:collapse={{ open: opening, duration: 0.35, easing: "cubic-bezier(.71,.7,.41,1.14)" }}>
    <slot />
  </div>
  <div class={opening ? "" : "buffer"} />
</div>

<style lang="scss">
  @import "../../css/dashinput.scss";
</style>
