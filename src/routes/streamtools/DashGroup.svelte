<script>
  import collapse from "svelte-collapse";
  import { setContext } from "svelte";
  import { fly, slide } from "svelte/transition";
  setContext("grouped", true);
  let opened = false;
  export let title = "";
  export let inner = false;

  function runClick() {
    opened = !opened;
  }
</script>

<div in:fly={{ x: 200, duration: 500 }} out:slide class="groupBox" class:inner style={opened ? "margin: 1rem 0rem" : ""}>
  <h2 class="collapse" class:opened title="click" on:click={runClick}>{title}</h2>
  <div class="group" class:groupShut={!opened} use:collapse={{ open: opened, duration: 0.35, easing: "cubic-bezier(.71,.7,.41,1.14)" }}>
    <slot />
  </div>
  <div class:buffer={!opened} />
</div>

<style lang="scss">
  @import "../../css/colours.scss";

  h2 {
    margin: 0;
    margin-top: 1rem;
    width: 65%;
  }

  .collapse {
    cursor: pointer;
    text-align: center;
    color: white;
    width: 60%;
    background-color: #525be1;
    background-color: $pink;
    &:hover {
      background-color: lighten($pink, 5);
    }
    padding: 1rem;
    margin: 1rem;
    //margin-left: 16%;
    //margin-bottom: 0rem;
    border-radius: 1rem;
    z-index: 2;
    transition: 0.15s cubic-bezier(0.71, 0.7, 0.41, 1.14) 0s !important;
  }

  .opened {
    background-color: lighten($black, 2);
    width: 80% !important;
    margin: 0;
    &:hover {
      background-color: lighten($black, 5);
    }
  }

  .group {
    background-color: #525be1;
    background-color: $pink;
    padding-left: 2rem;
    padding-right: 2rem;
    padding-top: 3rem;
    padding-bottom: 1rem;
    border-radius: 1rem;
    width: 80%;
    margin-top: -2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: 0.35s cubic-bezier(0.71, 0.7, 0.41, 1.14) 0s !important;
  }

  .groupShut {
    transition: all 0.5s ease;
    padding-top: 0rem !important;
    padding-bottom: 0rem !important;
    height: 0 !important;
    width: 60% !important;
    //margin: 0;
  }

  .buffer {
    margin-bottom: 2rem;
  }

  .groupBox {
    align-items: center;
    width: 100%;
    justify-content: center;
    display: flex;
    flex-direction: column;
  }
  .inner {
    width: 100%;
    padding: 0 !important;
    margin: 0;
    .opened {
      margin-left: -1rem;
    }
    .group {
      padding: 0;
    }
    h2 {
      margin: 0;
    }
  }
</style>
