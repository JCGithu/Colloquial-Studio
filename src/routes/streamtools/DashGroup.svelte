<script lang="ts">
  import collapse from "svelte-collapse";
  import { setContext, getContext } from "svelte";
  import { fly, slide } from "svelte/transition";
  setContext("grouped", true);
  let opened = false;
  export let title = "";
  export let inner = false;

  let MouseX = 1;
  let MouseY = 0;

  function runClick() {
    opened = !opened;
  }
</script>

<div in:fly={{ x: 200, duration: 500 }} out:slide class="groupBox" class:inner class:groupBoxOpen={opened}>
  <h2 style="--mouseX:{MouseX}px; --mouseY:{MouseY}px;" class:opened title="click" on:click={runClick}>{title}</h2>
  <div class="group" class:groupOpen={opened} class:groupShut={!opened} use:collapse={{ open: opened, duration: 0.35, easing: "cubic-bezier(.71,.7,.41,1.14)" }}>
    <slot />
  </div>
  <div class:buffer={!opened} />
</div>

<style lang="scss">
  @import "../../css/colours.scss";

  h2 {
    --shadow-color: 0deg 0% 5%;
    width: 65%;
    cursor: pointer;
    text-align: center;
    color: white;
    width: 60%;
    border-width: 0.6px 0.3px 0px 0.3px;
    border-width: 0px;
    border-color: lighten($pink, 15) lighten($pink, 5);
    border-style: solid;
    background: linear-gradient(0deg, $pink, lighten($pink, 15));
    background-size: 600% 600%;
    background-position: 50% 100%;
    padding: 1rem;
    margin: 1rem;
    text-decoration: underline;
    text-decoration-thickness: 3px;
    text-decoration-color: rgba(0, 0, 0, 0);
    //box-shadow: 0px 0px 5px darken($pink, 10);

    box-shadow: 0.2px 0.4px 0.5px hsl(var(--shadow-color) / 0.43), 0.7px 1.2px 1.5px -0.9px hsl(var(--shadow-color) / 0.41), 1.8px 3.1px 3.9px -1.8px hsl(var(--shadow-color) / 0.39), 4.5px 7.8px 9.8px -2.7px hsl(var(--shadow-color) / 0.37);
    border-radius: 1rem;
    z-index: 2;
    position: relative;
    z-index: 0;
    transform-style: preserve-3d;
    filter: saturate(1);
    transition: all 0.15s cubic-bezier(0.71, 0.7, 0.41, 1.14) 0s, background-position 0.5s ease-in-out, background-size 0.5s ease-in-out !important;
    &:hover {
      background-size: 150% 150%;
      box-shadow: 0px 0px 2px darken($pink, 5);
      //background-position: 50% 50%;
      text-decoration-color: $white;
      //background: linear-gradient(0deg, red, pink);
    }
  }

  .opened {
    width: 80% !important;
    margin: 0;
    //filter: saturate(0);
    //box-shadow: 0px 0px 10px fade-out($colloquial, 0.5);

    //background-position: 50% 0%;
  }

  .group {
    background-color: $pink;
    background-color: rgba(239, 114, 114, 0);
    //padding-left: 2rem;
    //padding-right: 2rem;
    padding-top: 3rem;
    padding-bottom: 1rem;
    border-radius: 1rem;
    width: 100%;
    margin-top: -2rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    border: 0px solid black;
    transition: 0.35s cubic-bezier(0.71, 0.7, 0.41, 1.14) 0s !important;
  }

  .groupOpen {
    border: 3px $pink solid;
    padding-bottom: 2rem;
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

  .groupBoxOpen {
    margin: 1rem 0rem;
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
