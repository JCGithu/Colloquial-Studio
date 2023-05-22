<script lang="ts">
  import { slide } from "svelte/transition";
  import { storage, currentGame, updateGame } from "./twFunctions";

  import SvgIcon from "../../SVGIcon.svelte";
  import Settings from "./settings.svelte";
  import HowTo from "./howTo.svelte";
  import Stats from "./stats.svelte";

  function menuSwap(i: number) {
    updateGame("menu", $currentGame.menu === i ? 0 : i);
  }

  console.log(currentGame);
</script>

<section class={$storage.dark ? "twordleDark" : "twordleLight"}>
  <div class="menu">
    <SvgIcon
      icon="help"
      fill="white"
      on:click={() => {
        menuSwap(1);
      }}
    />
    <SvgIcon
      icon="cog"
      on:click={() => {
        menuSwap(2);
      }}
    />
    <SvgIcon
      icon="stats"
      on:click={() => {
        menuSwap(3);
      }}
    />
  </div>
  {#if $currentGame.menu}
    <div id="overlay" transition:slide={{ axis: "x" }}>
      {#if $currentGame.menu === 2}
        <div class="contents">
          <h1>Settings</h1>
          <span>
            <Settings />
          </span>
          <button on:click={() => menuSwap(2)}>❯❯</button>
        </div>
      {:else if $currentGame.menu === 1}
        <div class="contents">
          <h1>How To Play!</h1>
          <span>
            <HowTo />
          </span>
          <button on:click={() => menuSwap(1)}>❯❯</button>
        </div>
      {:else if $currentGame.menu === 3}
        <div class="contents">
          <h1>Stats</h1>
          <span><Stats /></span>
          <button on:click={() => menuSwap(3)}>❯❯</button>
        </div>
      {/if}
    </div>
  {/if}
</section>

<style lang="scss">
  @use "../../../css/colours.scss" as *;
  @use "../../../css/default.scss" as d;

  section {
    position: absolute;
    width: 500px;
    @media screen and (max-width: d.$phone) {
      width: 100vw;
    }
    height: 100vh;
    display: flex;
    justify-content: flex-end;
    right: 0;
  }
  span {
    font-family: "Poppins";
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    //width: 50%;
    //background-color: var(--main);
    border-radius: 1rem;
    padding: 1rem;
    //margin-top: 5rem;
    transition: 1s all ease-in-out;
    color: var(--text);
    z-index: 2;
    max-height: 90vh;
    @media only screen and (max-width: "800px") {
      width: 100%;
    }
  }
  .contents {
    max-height: 75vh;
    width: 500px;
    padding: 0rem 2rem;
    @media screen and (max-width: d.$phone) {
      width: 100%;
    }
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .menu {
    width: max-content;
    height: 1.6rem;
    top: 0.5rem;
    right: 0.7rem;
    position: absolute;
    z-index: 1;
    background-color: var(--menuBackdrop);
    padding: 0.5rem;
    border-radius: 0.3rem;
    display: flex;
    z-index: 10;
    :global(svg) {
      pointer-events: all;
      cursor: pointer;
      width: 1.6rem;
      margin: 0.2rem;
      margin-top: 0;
    }
  }

  #overlay {
    background-color: var(--menuBackdrop);
    z-index: 5;
    display: flex;
    //flex-direction: column;
    //justify-content: center;
    align-items: center;
    // transform: translateX(100%);
    // transition: transform 0.3s cubic-bezier(0.075, 0.82, 0.165, 1);
    // &:has(div) {
    //   transform: translateX(0%);
    // }
  }
  button {
    align-self: center;
    background-color: transparent;
    width: max-content;
    padding: 0.5rem 2rem;
    border-radius: 1rem;
    border: 1px solid transparent;
    color: var(--titles);
    transition: all 0.2s ease-in-out;
    cursor: pointer;
    font-family: "Outfit";
    font-weight: 500;
    font-size: 1rem;
    transform: skewX(-5deg);
    &:hover {
      transform: scale(1.1) skewX(-5deg);
      //font-weight: 800;
      //border: 1px solid $white;
      text-shadow: 0px 0px 10px rgba(255, 255, 255, 0.2);
    }
  }
  h1 {
    font-size: "Outfit";
    color: var(--titles);
    font-weight: bold;
    font-size: 1.9rem;
    padding: 0;
    margin: 0;
    //text-decoration: underline;
    text-decoration-color: var(--purple);
  }
</style>
