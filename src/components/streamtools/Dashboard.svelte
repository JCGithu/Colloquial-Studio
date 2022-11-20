<script>
  export let urlFill = "";
  export let showInfo = false;
  export let showButtons = true;
  export let saves = new Array(3);
  let saveArray = new Array(3);
  let toastArray = [];

  import { fly, fade } from "svelte/transition";
  import { flip } from "svelte/animate";
  import { quintOut } from "svelte/easing";

  import { createEventDispatcher, onMount } from "svelte";
  const dispatch = createEventDispatcher();

  let toastID = 0;

  function ToastQueue(message) {
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

  export const toastUpdate = (i) => {
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
    console.log("wahoo", saves);
    setTimeout(() => {
      saveArray = Object.keys(saves);
    }, 1000);
  });
</script>

{#if showInfo}
  <div id="introMenu" class="infoScreen">
    <div class="infoBox">
      <button on:click={swapInfo}>Close</button>
      <slot name="info" />
      <h1><slot name="title" /></h1>
      <h3><slot name="subtitle" /></h3>
      <p><slot name="description" /></p>
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
    <slot name="settings" />
  </div>
</main>

<style lang="scss">
  @import "../../css/dashboard.scss";
</style>
