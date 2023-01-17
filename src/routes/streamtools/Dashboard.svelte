<script lang="ts">
  export let urlFill = "";
  export let showInfo = false;
  export let showButtons = true;
  export let saves = new Array(3);
  let userBackground = "#eae5db";
  let saveArray = new Array(3);
  let toastArray: Array<{ message: string; id: number }> = [];

  import { fly, fade } from "svelte/transition";
  import { createEventDispatcher, onMount, getContext } from "svelte";
  const dispatch = createEventDispatcher();

  let toastID = 0;
  let appDetails: appDetails = getContext("appDetails");

  function ToastQueue(message: string) {
    toastID++;
    toastArray.push({ message: message, id: toastID });
    toastArray = toastArray;
    setTimeout(() => {
      if (toastArray.length > 0) {
        toastArray.shift();
        toastArray = toastArray;
      }
    }, 5000);
  }

  export const toastUpdate = (i: string) => {
    ToastQueue(i);
  };

  let saveMenu = false;
  function swapInfo() {
    showInfo = !showInfo;
  }

  function copyURL() {
    navigator.clipboard.writeText(urlFill);
    ToastQueue("URL copied to clipboard");
  }
  function loadFromURL() {
    let urlData = window.prompt("Put in an existing URL", "URL here...");
    dispatch("loadURL", urlData);
    ToastQueue("Settings loaded from URL");
  }
  function saveData(num) {
    dispatch("saveData", num);
    saveMenu = !saveMenu;
    ToastQueue("Saved to File " + (num + 1));
  }
  function loadData(num) {
    dispatch("loadData", num);
    saveMenu = !saveMenu;
    ToastQueue("Loaded from Save " + (num + 1));
  }
  onMount(async () => {
    let localStore = window.localStorage.getItem(appDetails.name);
    if (!localStore) showInfo = true;
    setTimeout(() => {
      saveArray = Object.keys(saves);
    }, 1000);
  });
</script>

<svelte:head>
  <style>
    body {
      overflow: hidden;
    }
  </style>
</svelte:head>

{#if showInfo}
  <div id="introMenu" class="infoScreen" transition:fade>
    <div class="infoBox">
      <slot name="info" />
      <h1>{appDetails.title}</h1>
      <p><slot name="description" /><span>{appDetails.description}</span></p>
      <div id="credits">
        <span>Made on stream over at <a href="https://twitch.tv/colloquialowl">ColloquialOwl</a></span>
        <a href="https://ko-fi.com/K3K2231Z8" target="_blank"><img height="36" style="border:0px;height:36px;" src="https://storage.ko-fi.com/cdn/kofi3.png?v=3" border="0" alt="Buy Me a Coffee at ko-fi.com" /></a>
      </div>
      <button on:click={swapInfo} on:submit={swapInfo}>Close</button>
    </div>
  </div>
{/if}
<main style:--userBackground={userBackground}>
  {#if saveMenu}
    <div id="saveMenu" class="infoScreen" transition:fade>
      <div class="saveCollection">
        {#each saveArray as save, i}
          <span class={saves[save].channel ? "" : "blank"}>
            <p>Save {i + 1}:</p>
            <button on:click={() => saveData(i)}>{saves[save].channel ? "Overwrite" : "Save"}</button>
            <button on:click={() => loadData(i)}>Load</button>
          </span>
        {/each}
        <button id="closeSave" on:click={() => (saveMenu = !saveMenu)}>Close</button>
      </div>
    </div>
  {/if}
  <div id="toastBox">
    {#each toastArray as toasty (toasty.id)}
      <div in:fade out:fly={{ x: -200, duration: 1000 }} id="toast">
        {toasty.message}
      </div>
    {/each}
  </div>
  <div class="dashLeft">
    <div id="dashTitle" on:mouseenter={() => (showButtons = true)} on:mouseleave={() => (showButtons = false)}>
      <span id="backlink"><a href="/">Colloquial.Studio</a></span>
      <input id="outputURL" placeholder="URL will be here!" type="text" bind:value={urlFill} />
      <div id="barButtons">
        <img class="hoverBump" on:click={() => (saveMenu = !saveMenu)} id="save" alt="save" src="https://www.svgrepo.com/show/48810/floppy-disk-save-button.svg" />
        <div class="hoverBump">
          <span>BG</span>
          <input type="color" bind:value={userBackground} />
        </div>
      </div>
      {#if showButtons}
        <div class="buttons" transition:fly={{ duration: 200, y: -50 }}>
          <button id="go" class="tabbed" on:click={() => window.open(urlFill)}><span>Open Link</span></button>
          <button id="copy" class="tabbed" on:click={copyURL}><span>Copy Link</span></button>
          <button id="load" class="tabbed" on:click={loadFromURL}><span>Load from existing URL</span></button>
        </div>
      {/if}
    </div>
    <div id="dashApp">
      <slot name="app" />
    </div>
    <slot name="testing" />
  </div>
  <div id="dashControls" class="dashRight">
    <h1 on:click={swapInfo}>{appDetails.title}</h1>
    <slot name="settings" />
  </div>
</main>

<style lang="scss">
  @import "../../css/colours.scss";
  @import "../../css/dashboard.scss";

  main {
    --userBackground: #eae5db;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
    display: grid;
    grid-template-columns: 2.5fr 1fr;
    grid-template-rows: 1fr;
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    background-color: var(--userBackground);
    background-image: radial-gradient(at 18% 25%, rbga(255, 255, 255, 0.5) 0px, transparent 50%), radial-gradient(at 91% 63%, rbga(0, 0, 0, 0.5) 0px, transparent 50%), radial-gradient(at 35% 29%, hsla(0, 0%, 15%, 0.2) 0px, transparent 50%), radial-gradient(at 48% 44%, hsla(0, 0%, 48%, 0.2) 0px, transparent 50%), radial-gradient(at 34% 77%, hsla(0, 0%, 100%, 0.2) 0px, transparent 50%), radial-gradient(at 63% 54%, hsla(0, 0%, 100%, 0.1) 0px, transparent 50%),
      radial-gradient(at 72% 11%, hsla(0, 0%, 0%, 1) 0px, transparent 50%);
  }

  #dashControls,
  #dashTitle {
    &::-webkit-scrollbar-track {
      background-clip: padding-box;
      border-radius: 100px;
      background-color: $white;
      padding-right: 0.5rem;
      margin: 1rem;
      width: 10px;
      border: 8px solid rgba(0, 0, 0, 0);
    }

    &::-webkit-scrollbar {
      width: 25px;
      background-color: rgba(0, 0, 0, 0);
      margin-right: 1rem;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 100px;
      border: 8px solid rgba(0, 0, 0, 0);
      background-color: $pink;
      background-clip: padding-box;
    }
  }

  #dashApp {
    display: flex;
    position: relative;
    flex-grow: 1;
    overflow: none;
    max-height: calc(100% - 5rem);
    width: calc(100% - 2rem);
    padding: 1rem;
  }

  .infoBox {
    border-radius: 1rem;
    position: relative;
    padding: 1rem;
    padding-top: 2rem;
    width: 80%;
    max-width: 700px;
    text-align: center;
    white-space: pre-wrap;
    background-color: $black;
    display: flex;
    flex-direction: column;
    align-items: center;
    p {
      margin: 0;
    }
    button {
      margin-top: 1rem;
      position: relative;
      background-color: $black;

      z-index: 2;
    }
  }

  #credits {
    border: 0.2rem solid $white;
    border-radius: 1rem;
    margin-top: 1rem;
    display: flex;
    flex-direction: column;
    white-space: normal;
    width: max-content;
    padding: 0.5rem 1rem;
    background-color: fade-out($white, 0.9);
    img {
      margin-top: 0.5rem;
      transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
      &:hover {
        transform: scale(1.05) rotate(2deg);
      }
    }
    a {
      color: $pink;
    }
  }

  .hoverBump {
    transform: translateY(0.5rem);
    transition: all 0.3s;
    &:hover {
      transform: translateY(-0.1rem) rotate(3deg);
    }
  }

  #barButtons {
    img {
      position: relative;
      cursor: pointer;
      filter: invert(100%);
      border-radius: 0.5rem;
      background-color: invert($black);
      padding: 0.8rem;
      height: 2rem;
      margin-right: 0.3rem;
    }
    input {
      position: relative;
      cursor: pointer;
      border-radius: 0.5rem;
      height: 2.8rem;
      width: 2.8rem;
      padding: 0;
      box-shadow: none !important;
      border: 0.2rem $black solid;
      background-color: rgba(0, 0, 0, 0);
    }
    div {
      position: relative;
      display: flex;
      justify-items: center;
      justify-content: center;
      align-items: center;

      span {
        position: absolute;
        z-index: 2;
        pointer-events: none;
        font-weight: bold;
      }
      input {
        z-index: 1;
      }
    }
    top: 0.5rem;
    right: 0.5rem;
    z-index: 10;
    position: absolute;
    padding: 0.8rem;
    display: flex;
  }
  ::-webkit-color-swatch,
  ::-webkit-color-swatch-wrapper {
    border: none;
    padding: 0;
    border-radius: 0.3rem;
  }
  #appBG {
    min-height: 100vh;
    min-width: 100vw;
  }
  #noise {
    position: absolute;
    left: 0;
    top: 0;
    min-width: 100%;
    min-height: 100%;
    mix-blend-mode: overlay;
    opacity: 0.2;
    pointer-events: none;
  }
</style>
