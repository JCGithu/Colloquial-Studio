<script lang="ts">
  import { fly, fade, slide } from "svelte/transition";
  import { onMount, getContext } from "svelte";
  import { Popover, PopoverButton, PopoverPanel } from "@rgossiaux/svelte-headlessui";

  import SVGIcon from "../SVGIcon.svelte";
  export let urlFill = "";
  export let showInfo = false;
  export let showButtons = true;
  export let saves = [false, false, false];

  export let dashboardParams: standardObject;
  export let runningParams: standardObject;

  let baseURL = "";
  let openMenu = false;

  let userBackground = "#242423";
  let toastArray: Array<{ message: string; id: number }> = [];

  import { loadURL, loadSave, urlBuild, save } from "./params";
  import DashButton from "./DashButton.svelte";
  import SvgIcon from "../SVGIcon.svelte";

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
      <DashButton text="close" on:click={toggleInfoScreen} on:submit={toggleInfoScreen} />
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
    <span id="return"><a href="/"><SvgIcon icon="logo" /></a></span>
    {#each toastArray as toasty (toasty.id)}
      <div in:fade out:fly={{ x: -200, duration: 1000 }} id="toast">
        {toasty.message}
      </div>
    {/each}
  </div>
  <div id="dashControls">
    <h1 on:click={toggleInfoScreen}>{appDetails.title}</h1>
    <slot name="settings" />
  </div>
  <div class="dashLeft">
    <div id="dashTopBar" on:mouseenter={() => (showButtons = true)} on:mouseleave={() => (showButtons = false)}>
      <Popover class="PopOver">
        <PopoverButton class="PopOverButton">
          <SVGIcon fill="hsl(40, 26%, 89%)" />
        </PopoverButton>
        <PopoverPanel class="PopOverPanel">
          <div class="panel-contents" transition:slide>
            <h4>URL Links</h4>
            <div id="go" on:click={openURL}>Open Link</div>
            <div id="copy" on:click={copyURL}><span>Copy Link</span></div>
            <div id="load" on:click={loadFromURL}>Load existing URL</div>
            <h4>Settings</h4>
            <div on:click={toggleInfoScreen}>Info</div>
            <div id="save" on:click={() => (saveMenu = !saveMenu)}>Saves</div>
            <div class="panelInput">
              <label style="--bg:{userBackground}">Background Colour</label>
              <input type="color" bind:value={userBackground} />
            </div>
          </div>
        </PopoverPanel>
      </Popover>
      <input id="outputURL" placeholder="URL will be here!" type="text" bind:value={urlFill} />
    </div>
    <div id="dashApp">
      <slot name="app" />
    </div>
    <slot name="testing" />
  </div>
  <svg viewBox="0 0 500 500" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" style="display: none;">
    <filter id="noiseFilter">
      <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" stitchTiles="stitch" />
    </filter>
  </svg>
</main>

<style lang="scss">
  @import "../../css/default.scss";
  @import "../../css/colours.scss";

  main {
    --userBackground: $white;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
    display: grid;
    grid-template-columns: 1fr 2.5fr;
    grid-template-rows: 1fr;
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    @media screen and (max-width: $phone) {
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }
    * {
      z-index: 2;
    }
    background-color: var(--userBackground);
    background-image: radial-gradient(at 18% 25%, rbga(255, 255, 255, 0.5) 0px, transparent 50%), radial-gradient(at 91% 63%, rbga(0, 0, 0, 0.5) 0px, transparent 50%), radial-gradient(at 35% 29%, hsla(0, 0%, 15%, 0.2) 0px, transparent 50%), radial-gradient(at 48% 44%, hsla(0, 0%, 48%, 0.2) 0px, transparent 50%), radial-gradient(at 34% 77%, hsla(0, 0%, 100%, 0.2) 0px, transparent 50%), radial-gradient(at 63% 54%, hsla(0, 0%, 100%, 0.1) 0px, transparent 50%),
      radial-gradient(at 72% 11%, hsla(0, 0%, 0%, 1) 0px, transparent 50%);
    &::after {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      filter: url(#noiseFilter);
      opacity: 0.3;
      mix-blend-mode: overlay;
      pointer-events: none;
      z-index: 1;
    }
  }

  h1 {
    //font-weight: bold;
    position: relative;
    font-family: Marlin;

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
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: calc(33vw - 3rem);
    padding: 3rem 1.5rem 2rem 1.5rem;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-gutter: stable;
    // background-image: radial-gradient(circle at center, rgba(0, 0, 0, 0.05) 0.2rem, transparent 0), radial-gradient(circle at center, rgba(0, 0, 0, 0.05) 0.2rem, transparent 0);
    // background-size: 1.3rem 1.3rem;
    // background-position: 0 0, 0.65rem 0.65rem;

    @media only screen and (max-width: $phone) {
      padding: 3rem 1rem 1rem 1rem;
      height: 40vh;
      width: 100vw;
      border-bottom: 1px $whiteFade solid;
      -webkit-mask-image: -webkit-gradient(linear, left 90%, left bottom, from(rgba(0, 0, 0, 1)), to(rgba(0, 0, 0, 0)));
    }

    &::-webkit-scrollbar-track {
      background-clip: padding-box;
      border-radius: 100px;
      background-color: $black;
      padding-right: 0.5rem;
      margin: 1rem;
      width: 10px;
      border: 8px solid transparent;
      cursor: pointer !important;
    }

    &::-webkit-scrollbar {
      width: 25px;
      background-color: transparent;
      margin-right: 1rem;
      cursor: pointer !important;
      //opacity: 0.5;
    }

    &::-webkit-scrollbar-thumb {
      border-radius: 100px;
      border: 8px solid transparent;
      //border-top: 8px red;
      background: lighten($black, 8);
      background-size: 100%;
      background-position: 0% 0%;
      background-clip: padding-box;
      cursor: pointer !important;
    }
  }

  #dashApp {
    display: flex;
    position: relative;
    flex-grow: 1;
    overflow: none;
    z-index: 3;
    max-height: calc(100% - 4rem);
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
    margin: 1rem 0;
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
      color: $colloquial;
    }
  }

  //TOP BAR
  #dashTopBar {
    font-size: 16px;
    border-color: transparent;
    display: grid;
    grid-template-columns: 50px 1fr;
    grid-template-rows: 1fr;
    grid-column-gap: 0px;
    grid-row-gap: 0px;
    text-align: left;
    position: relative;
    z-index: 5;
    height: 2rem;
    min-height: 2rem;
    margin: 1rem 1rem 0rem 1rem;
    input {
      border-style: solid;
      border-color: $white;
      border-width: 1px;
      border-radius: 1rem;
      outline: none;
      font-family: "Poppins";
      position: relative;
      //width: calc(100% - 130px - 3rem);
      //padding: 1rem 3rem 1rem 130px;
      transition: all 1s;
      margin: 0;
      padding: 0 0.75rem;
      //padding-left: 0.5rem;
      opacity: 1;
      color: $white;
      background-color: transparent !important;
      //height: calc(100% - 0.1rem);
      &::placeholder {
        color: $white;
      }
      &::selection {
        background-color: $colloquial;
      }
      &:hover,
      &:focus {
        background-color: transparent !important;
        color: $white;
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
    border-radius: 1rem;
    background-color: transparent;
    //border-radius: 0.3rem;
    padding-top: 0.2rem;
    padding: 0;
    height: 100%;
    max-height: 2rem;
    width: 100%;
    fill: $white;
    position: relative;
    transition: all 0.4s ease-in-out;
    &:hover {
      transform: scale(1.1);
      //background-color: fade-out($colloquial, 0.2);
    }
    img {
      height: 100%;
      padding: 0;
      margin: 0;
    }
    cursor: pointer;
    svg {
      fill: $white;
      &:hover {
        animation: spinOnce 0.5s cubic-bezier(0.53, 1.5, 0.15, 0.99);
      }
    }
  }
  :global(.PopOverPanel) {
    background-color: transparent;
    border: solid $black 3px;
    top: calc(100% + 1.25rem);
    width: max-content;
    left: 0.25rem;
    padding-bottom: 0.3rem;
    position: absolute;
    z-index: 10;
    border-radius: 0.7rem;

    //overflow: hidden;
  }
  .panel-contents {
    color: $black;
    h4 {
      color: $white;
      margin: 0rem;
      //background-color: fade-out(black, 0.5);
      background-color: $black;
      padding: 0.3rem 1rem;
      text-align: center;
      margin-bottom: 0.25rem;
      margin-top: 0.25rem;
      &:nth-child(1) {
        margin-top: 0;
      }
    }

    div {
      margin: 0 0.3rem;
      padding-right: 1rem;
      position: relative;
      cursor: pointer;
      padding: 0.2rem 1rem;
      display: flex;
      flex-direction: row;
      border-radius: 1rem;
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
        background-color: lighten($black, 3);
      }
    }
    input {
      position: absolute !important;
      top: 0;
      left: 0;
      cursor: pointer;
      width: 100%;
      height: 100%;
      padding: 0;
      overflow: hidden;
      box-shadow: none !important;
      background-color: transparent;
      border: none !important;
      border-color: transparent;
      &:hover {
        outline: none;
        border: none !important;
      }
      &::-webkit-color-swatch-wrapper {
        height: 100%;
        width: 100%;
        position: absolute;
        left: 0;
        top: 0;
        background-color: transparent;
      }
    }
    label {
      z-index: 10;
      position: relative;
      color: var(--bg);
      pointer-events: none;
      filter: invert(1) saturate(0) contrast(10);
    }
  }
  .panelInput {
    &:hover {
      background-color: transparent !important;
    }
  }
  #backlink {
    color: white;
    font-style: bold;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    width: fit-content;
    height: 100%;
    padding: 0rem 0rem 0rem 1rem;
    background-color: $colloquial;
    a {
      height: 20px;
      padding-bottom: 2px;
      width: 20px;
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
      border: $colloquial 3px solid;
      background-color: $black;
    }
    p {
      margin-right: 0.5rem;
    }
    button {
      background-color: $colloquial;
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

  //Backlink
  #return {
    width: 30px;
    height: 30px;
    position: absolute;
    top: 0;
    left: 0;
    margin: 10px 0px 0px 10px;
    opacity: 0.8;
    cursor: pointer;
    pointer-events: all;
    &:hover {
      opacity: 1;
    }
  }

  //TOAST
  #toastBox {
    position: absolute;
    width: calc(33vw - 3rem);
    height: calc(100% - 1rem);
    left: 0;
    bottom: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-bottom: 1rem;
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
    background-color: $white;
    color: $black;
    border-radius: 0.5em;
    padding: 0.5em;
    margin: 0.2em;
    width: 250px;
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
