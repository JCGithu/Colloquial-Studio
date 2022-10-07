<script>
  export let urlFill = "";
  export let showInfo = false;
  export let showButtons = true;
  export let saves = new Array(3);
  import { fly, fade } from "svelte/transition";

  import { createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  let saveMenu = false;
  function swapInfo() {
    showInfo = !showInfo;
  }

  function loadFromURL() {
    let urlData = window.prompt("Put in an existing URL", "URL here...");
    dispatch("loadURL", urlData);
  }
  function saveData(num) {
    dispatch("saveData", num);
    saveMenu = !saveMenu;
  }
  function loadData(num) {
    dispatch("loadData", num);
    saveMenu = !saveMenu;
  }
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
        {#each saves as save, i}
          <span>
            <p>Save {i + 1}:</p>
            <button on:click={() => saveData(i)}>Overwrite</button>
            <button on:click={() => loadData(i)}>Load</button>
          </span>
        {/each}
        <button on:click={() => (saveMenu = !saveMenu)}>Close</button>
      </div>
    </div>
  {/if}
  <div class="dashLeft">
    <div id="dashTitle" on:mouseenter={() => (showButtons = true)} on:mouseleave={() => (showButtons = false)}>
      <span id="backlink"><a href="/">Colloquial.Studio</a></span>
      <input id="outputURL" placeholder="URL will be here!" type="text" bind:value={urlFill} />
      <img on:click={() => (saveMenu = !saveMenu)} id="save" alt="save" src="https://www.svgrepo.com/show/48810/floppy-disk-save-button.svg" />
      {#if showButtons}
        <div class="buttons" transition:fly={{ duration: 200, y: -50 }}>
          <button id="go" on:click={() => window.open(urlFill)}><span>Open Link</span></button>
          <button id="copy" on:click={() => navigator.clipboard.writeText(urlFill)}><span>Copy Link</span></button>
          <button id="load" on:click={loadFromURL}><span>Load from existing URL</span></button>
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
