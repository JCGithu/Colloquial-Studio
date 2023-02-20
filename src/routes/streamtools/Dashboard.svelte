<script lang="ts">
  export let urlFill = "";
  export let showInfo = false;
  export let showButtons = true;
  export let saves = [false, false, false];

  export let dashboardParams: standardObject;
  export let runningParams: standardObject;

  let baseURL = "";

  let userBackground = "#eae5db";
  let toastArray: Array<{ message: string; id: number }> = [];

  import { loadURL, loadSave, urlBuild, save } from "./params";

  import { fly, fade } from "svelte/transition";
  import { createEventDispatcher, onMount, getContext } from "svelte";
  const dispatch = createEventDispatcher();

  //CONTEXT
  let appDetails: appDetails = getContext("appDetails");

  //TOAST
  let toastID = 0;
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
  function toggleInfoScreen() {
    showInfo = !showInfo;
  }

  //URL FUNCTIONS
  function copyURL() {
    navigator.clipboard.writeText(urlFill);
    ToastQueue("URL copied to clipboard");
  }

  async function loadFromURL() {
    let urlData = window.prompt("Put in an existing URL", "URL here...");
    dashboardParams = await loadURL(urlData || "", appDetails.name);
    urlFill = urlBuild(dashboardParams, baseURL);
    runningParams = dashboardParams;
    ToastQueue("Settings loaded from URL");
  }

  //DATA FUNCTIONS
  function saveData(num: number) {
    saveMenu = !saveMenu;
    save(dashboardParams, appDetails.name, num);
    ToastQueue("Saved to File " + (num + 1));
  }
  async function loadData(num: number) {
    dashboardParams = await loadSave(num, appDetails.name);
    saveMenu = !saveMenu;
    urlFill = urlBuild(dashboardParams, baseURL);
    ToastQueue("Loaded from Save " + (num + 1));
  }

  onMount(async () => {
    //Pulling actual base URL
    baseURL = window.location.href.split("?data=")[0];

    //Pulling Localstorage info for saves
    setTimeout(() => {
      dashboardParams.saves.forEach((s: boolean) => {
        if (s) showInfo = false;
      });
      saves = dashboardParams.saves;
    }, 500);
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
        <a href="https://ko-fi.com/K3K2231Z8" target="_blank" rel="noreferrer"><img height="36" style="border:0px;height:36px;" src="https://storage.ko-fi.com/cdn/kofi3.png?v=3" alt="Buy Me a Coffee at ko-fi.com" /></a>
      </div>
      <button on:click={toggleInfoScreen} on:submit={toggleInfoScreen}>Close</button>
    </div>
  </div>
{/if}
<main style:--userBackground={userBackground}>
  {#if saveMenu}
    <div id="saveMenu" class="infoScreen" transition:fade>
      <div class="saveCollection">
        {#each saves as save, i}
          <span class:blank={!saves[i]}>
            <p>Save {i + 1}:</p>
            <button on:click={() => saveData(i)}>{saves[i] ? "Overwrite" : "Save"}</button>
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
    <h1 on:click={toggleInfoScreen}>{appDetails.title}</h1>
    <slot name="settings" />
  </div>
</main>

<style lang="scss">
  @import "../../css/colours.scss";

  $breakpoint: 900px;
  $titles: $deepBlue;
  $sideB: $black;

  main {
    --userBackground: $white;
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

  h1 {
    color: $titles;
    font-weight: bold;
    margin: 0;
    font-size: 2.5rem;
    margin: 0;
    padding: 0;
    margin-top: -1.5rem;
    margin-bottom: 0.3rem;
    text-decoration: underline;
    //font-size: clamp(1rem, -0.1475rem + 2.623vw, 3rem);
    color: $white;
    text-decoration-color: $colloquial;
    text-underline-offset: 5px;
    text-align: center;
    cursor: pointer;
    transition: 0.3s all;
    &:hover {
      color: white;
      transform: scale(1.05);
    }
  }

  #dashTitle {
    border-color: $colloquial;
    border-style: solid;
    border-width: 0px 0px 3px 0px;
    text-align: left;
    position: relative;
    z-index: 5;
    height: 3rem;
    min-height: 3rem;
    input {
      z-index: 6;
    }
    .buttons {
      position: absolute;
      bottom: -2.5rem;
      left: 11%;
      z-index: 5;
      button {
        background-color: $pink;
      }
    }
  }

  #dashControls {
    display: flex;
    flex-direction: column;
    width: calc(35vw - 3rem);
    padding: 3rem 1.5rem 2rem 1.5rem;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: $sideB;
    @media only screen and (max-width: $breakpoint) {
      padding: 1rem 1rem 2rem 1rem;
    }
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

  .dashLeft {
    height: 100vh;
    width: 65vw;
    display: flex;
    flex-direction: column;
  }

  //INFO
  .infoScreen {
    width: 100vw;
    height: 100vh;
    display: flex;
    position: absolute;
    z-index: 20;
    margin: 0;
    padding: 0;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    background-color: rgba(0, 0, 0, 0.6);
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
    height: fit-content;
    color: $white;
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

  input {
    outline: none;
    border: none;
    font-family: "Poppins";
    position: absolute;
    top: 0;
    left: 0;
    background-color: $black;
    background-color: white;
    width: calc(100% - 130px - 3rem);
    height: calc(100% - 2rem);
    padding: 1rem 3rem 1rem 130px;
    transition: all 1s;
    opacity: 1;
    color: $black;
    &::selection {
      background-color: $deepBlue !important;
    }
    box-shadow: inset 0px 0px 0px -60px $deepBlue;
    &:hover {
      box-shadow: inset 0px -207px 0px -200px $pink !important;
      //background-color: $black;
    }
  }
  //BUTTONS
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

  #backlink {
    font-size: 0.7rem;
    color: white;
    font-style: bold;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 20;
    height: fit-content;
    width: fit-content;
    padding: 0.5rem;
    padding-right: 1rem;
    border-radius: 0 0 1rem 0;
    background-color: $colloquial;
    a {
      color: white;
      text-decoration: none;
      &:hover {
        text-decoration: underline;
      }
    }
  }

  button {
    font-family: "Poppins";
    //font-weight: bold;
    font-size: large;
    padding: 0.5rem;
    margin-right: 0.5rem;
    border-radius: 0.5rem;
    color: white;
    border: none;
    cursor: pointer;
    box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0);
    transition: all 250ms cubic-bezier(0.25, 0.25, 0.5, 1.9);
    transform: translateY(-0.1rem);
    &:hover {
      transform: translateY(-0.2rem);
      //box-shadow: 0px 3px 0px 0px rgba(255, 255, 255, 1);
    }
    &:active {
      transform: translateY(0rem);
      //box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0);
    }
  }
  .tabbed {
    border-radius: 0 0 0.5rem 0.5rem;
  }

  ::-webkit-color-swatch,
  ::-webkit-color-swatch-wrapper {
    border: none;
    padding: 0;
    border-radius: 0.3rem;
  }
  .blank {
    opacity: 0.3;
    transition: 1s all;
    &:hover {
      opacity: 0.7;
    }
  }
  //SAVES
  .saveCollection {
    display: flex;
    flex-direction: column;
    align-items: center;
    #closeSave {
      width: 60%;
    }
  }

  #saveMenu {
    display: flex;
    flex-direction: column;
    div {
      padding: 1rem;
      border-radius: 1rem;
      border: $pink 3px solid;
      background-color: $black;
    }
    p {
      margin-right: 0.5rem;
    }
    button {
      background-color: $pink;
      border-radius: 0.5rem;
      margin: 0.25rem;
    }
    span {
      display: flex;
      align-items: center;
      color: white;
      margin: 1rem;
      padding: 0.2rem 2rem;
      //border-radius: 1rem;
      border-width: 0px 0px 3px 0px;
      border-color: $white;
      border-style: solid;
    }
  }

  //TOAST
  #toastBox {
    position: absolute;
    width: 200px;
    height: 100%;
    left: 0;
    bottom: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-direction: column;
    pointer-events: none;
  }

  #toast {
    background-color: fade-out($black, 0.2);
    color: $white;
    border-radius: 0.5em;
    padding: 0.5em;
    margin: 0.2em;
    width: 90%;
    text-align: center;
    pointer-events: visible;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      background-color: $black;
    }
  }
</style>
