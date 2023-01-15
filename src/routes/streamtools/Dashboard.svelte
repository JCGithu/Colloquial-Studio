<script lang="ts">
  export let urlFill = "";
  export let showInfo = false;
  export let showButtons = true;
  export let saves = new Array(3);
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
  <div id="introMenu" class="infoScreen">
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
<main>
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
      <img on:click={() => (saveMenu = !saveMenu)} id="save" alt="save" src="https://www.svgrepo.com/show/48810/floppy-disk-save-button.svg" />
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
</style>
