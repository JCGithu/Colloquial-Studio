<script lang="ts">
  import { fly, fade, slide } from "svelte/transition";
  import { onMount, getContext } from "svelte";
  import { Popover, PopoverButton, PopoverPanel } from "@rgossiaux/svelte-headlessui";

  export let urlFill = "";
  export let showInfo = false;
  export let showButtons = true;
  export let saves = [false, false, false];

  export let dashboardParams: standardObject;
  export let runningParams: standardObject;

  let baseURL = "";
  let openMenu = false;

  let userBackground = "#eae5db";
  let toastArray: Array<{ message: string; id: number }> = [];

  import { loadURL, loadSave, urlBuild, save } from "./params";

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
  function openURL() {
    if (urlFill) {
      window.open(urlFill);
    } else {
      ToastQueue("No URL generated yet!");
    }
  }
  function copyURL() {
    navigator.clipboard.writeText(urlFill);
    ToastQueue("URL copied to clipboard");
  }

  async function loadFromURL() {
    let urlData = window.prompt("Put in an existing URL", "URL here...");
    if (!urlData) return;
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
      let cancelShow = false;
      console.log(dashboardParams.saves);
      dashboardParams.saves.forEach((s: boolean) => {
        if (s && !cancelShow) cancelShow = true;
      });
      if (!cancelShow) showInfo = true;
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
    <div id="dashTopBar" on:mouseenter={() => (showButtons = true)} on:mouseleave={() => (showButtons = false)}>
      <span id="backlink"><a href="/">Colloquial.Studio</a></span>
      <input id="outputURL" placeholder="URL will be here!" type="text" bind:value={urlFill} />
      <Popover class="PopOver">
        <PopoverButton class="PopOverButton">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -256 1792 1792">
            <path
              d="M1024 640q0 106-75 181t-181 75q-106 0-181-75t-75-181q0-106 75-181t181-75q106 0 181 75t75 181zm512 109V527q0-12-8-23t-20-13l-185-28q-19-54-39-91 35-50 107-138 10-12 10-25t-9-23q-27-37-99-108t-94-71q-12 0-26 9l-138 108q-44-23-91-38-16-136-29-186-7-28-36-28H657q-14 0-24.5 8.5T621-98L593 86q-49 16-90 37L362 16q-10-9-25-9-14 0-25 11-126 114-165 168-7 10-7 23 0 12 8 23 15 21 51 66.5t54 70.5q-27 50-41 99L29 495q-13 2-21 12.5T0 531v222q0 12 8 23t19 13l186 28q14 46 39 92-40 57-107 138-10 12-10 24 0 10 9 23 26 36 98.5 107.5T337 1273q13 0 26-10l138-107q44 23 91 38 16 136 29 186 7 28 36 28h222q14 0 24.5-8.5T915 1378l28-184q49-16 90-37l142 107q9 9 24 9 13 0 25-10 129-119 165-170 7-8 7-22 0-12-8-23-15-21-51-66.5t-54-70.5q26-50 41-98l183-28q13-2 21-12.5t8-23.5z"
              transform="matrix(1 0 0 -1 121.492 1285.424)"
            /></svg
          >
        </PopoverButton>
        <PopoverPanel class="PopOverPanel">
          <div class="panel-contents" transition:slide>
            <h4>URL Links</h4>
            <div id="go" on:click={openURL}>Open Link</div>
            <div id="copy" on:click={copyURL}><span>Copy Link</span></div>
            <div id="load" on:click={loadFromURL}>Load from existing URL</div>
            <h4>Settings</h4>
            <div id="save" on:click={() => (saveMenu = !saveMenu)}>Saves</div>
            <div>
              <label style="--bg:{userBackground}">Background Colour</label>
              <input type="color" bind:value={userBackground} />
            </div>
          </div>
        </PopoverPanel>
      </Popover>
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
  @import "../../css/default.scss";
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
    @media screen and (max-width: $phone) {
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }
    background-color: var(--userBackground);
    background-image: radial-gradient(at 18% 25%, rbga(255, 255, 255, 0.5) 0px, transparent 50%), radial-gradient(at 91% 63%, rbga(0, 0, 0, 0.5) 0px, transparent 50%), radial-gradient(at 35% 29%, hsla(0, 0%, 15%, 0.2) 0px, transparent 50%), radial-gradient(at 48% 44%, hsla(0, 0%, 48%, 0.2) 0px, transparent 50%), radial-gradient(at 34% 77%, hsla(0, 0%, 100%, 0.2) 0px, transparent 50%), radial-gradient(at 63% 54%, hsla(0, 0%, 100%, 0.1) 0px, transparent 50%),
      radial-gradient(at 72% 11%, hsla(0, 0%, 0%, 1) 0px, transparent 50%);
  }

  h1 {
    color: $titles;
    font-weight: bold;
    position: relative;
    margin: 0;
    width: max-content;
    font-size: 2.5rem;
    margin: 0;
    padding: 0;
    margin-top: -1.5rem;
    margin-bottom: 0.3rem;
    //text-decoration: underline;
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
      &::after {
        background-position: 99% 99%;
        border-color: (rgba(0, 0, 0, 0));
        box-shadow: 0px 0px 5px $colloquial;
      }
    }
    &::after {
      position: absolute;
      content: "";
      bottom: 5px;
      left: 0;
      width: 100%;
      height: 3px;
      background: $colloquial;
      box-shadow: 0px 0px 0px $colloquial;
      background: linear-gradient(270deg, lighten($colloquial, 10), $colloquial);
      background-size: 300%;
      background-position: 0% 0%;
      border: 0.5px $colloquial solid;
      transition: all 0.4s ease-in-out;
    }
  }

  #dashControls {
    cursor: default;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: calc(33vw - 3rem);
    padding: 3rem 1.5rem 2rem 1.5rem;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: $sideB;
    @media only screen and (max-width: $phone) {
      padding: 3rem 1rem 5rem 1rem;
      height: max-content;
      width: 100vw;
    }

    &::-webkit-scrollbar-track {
      background-clip: padding-box;
      border-radius: 100px;
      background-color: lighten($black, 8);
      padding-right: 0.5rem;
      margin: 1rem;
      width: 10px;
      border: 8px solid rgba(0, 0, 0, 0);
      cursor: pointer !important;
    }

    &::-webkit-scrollbar {
      width: 25px;
      background-color: rgba(0, 0, 0, 0);
      margin-right: 1rem;
      cursor: pointer !important;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 100px;
      border: 8px solid rgba(0, 0, 0, 0);
      //border-top: 8px red;
      background: linear-gradient(180deg, lighten($colloquial, 5), $colloquial);
      background-size: 100%;
      background-position: 0% 0%;
      //background-color: $pink;
      background-clip: padding-box;
      cursor: pointer !important;
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
    width: 67vw;
    display: flex;
    flex-direction: column;
    @media screen and (max-width: $phone) {
      width: 100vw;
      height: 50vh;
      min-height: 50vh;
    }
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
    background-color: fade-out($colloquial, 0.3);
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

  //TOP BAR
  #dashTopBar {
    border-color: $colloquial;
    border-style: solid;
    border-width: 0px 0px 3px 0px;
    display: grid;
    grid-template-columns: 125px 1fr 50px;
    grid-template-rows: 1fr;
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    text-align: left;
    position: relative;
    z-index: 5;
    height: 3rem;
    min-height: 3rem;
    background-color: white;
    input {
      outline: none;
      border: none;
      font-family: "Poppins";
      position: relative;
      //width: calc(100% - 130px - 3rem);
      //padding: 1rem 3rem 1rem 130px;
      transition: all 1s;
      opacity: 1;
      color: $black;
      &::selection {
        background-color: fade-out($colloquial, 0.5);
      }
    }
  }
  :global(.PopOver) {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  @keyframes spinOnce {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(90deg);
    }
  }
  :global(.PopOverButton) {
    border: none;
    outline: none;
    width: 35px;
    height: 35px;
    border-radius: 0.3rem;
    padding-top: 0.2rem;
    position: relative;
    background-color: fade-out($black, 0.5);
    transition: all 0.4s ease-in-out;
    &:hover {
      background-color: fade-out($black, 0.2);
    }
    cursor: pointer;
    svg {
      fill: white;
      &:hover {
        animation: spinOnce 0.5s cubic-bezier(0.53, 1.5, 0.15, 0.99);
      }
    }
  }
  :global(.PopOverPanel) {
    background-color: $black;
    border: solid $colloquial;
    border-width: 0px 0px 3px 3px;
    top: 100%;
    width: max-content;
    right: 0;
    //padding-bottom: 0.3rem;
    position: absolute;
    z-index: 10;
    border-radius: 0 0 0 1rem;
    overflow: hidden;
  }
  .panel-contents {
    color: $white;
    h4 {
      color: white;
      margin: 0rem;
      background-color: fade-out(black, 0.5);
      padding: 0.3rem 1rem;
    }
    div {
      padding-right: 1rem;
      position: relative;
      cursor: pointer;
      padding: 0.2rem 1rem;
      display: flex;
      flex-direction: row;
      &:nth-child(1) {
        border-width: 0px;
      }
      border-color: fade-out($white, 0.9);
      border-width: 0.5px 0px 0px 0px;
      border-style: solid;
      border-radius: 0;
      img {
        height: 1.2rem;
        padding-left: 0.4rem;
        padding-top: 0.2rem;
        filter: invert(1);
      }
      transition: 0.3s all ease-in-out;
      &:hover {
        color: white;
        padding-left: 1.2rem;
        padding-right: 0.8rem;
        border-radius: 1rem;
        background-color: lighten($black, 3);
      }
    }
    input {
      position: absolute !important;
      top: 0;
      left: 0;
      cursor: pointer;
      //border-radius: 100%;
      //height: 1.4rem;
      width: 100%;
      height: 100%;
      padding: 0;
      box-shadow: none !important;
      border: 0.2rem $black solid;
      background-color: rgba(0, 0, 0, 0);
    }
    label {
      z-index: 10;
      position: relative;
      color: var(--bg);
      pointer-events: none;
      filter: invert(1) saturate(0) contrast(10);
    }
  }
  #backlink {
    font-size: 0.7rem;
    color: white;
    font-style: bold;
    position: relative;
    // top: 0;
    // left: 0;
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

  ::-webkit-color-swatch,
  ::-webkit-color-swatch-wrapper {
    border: none;
    padding: 0;
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
    @media screen and (max-width: $phone) {
      height: 50%;
      bottom: 75%;
      left: 25%;
      width: 50%;
    }
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
    @media screen and (max-width: $phone) {
      background-color: $black;
    }
  }
</style>
