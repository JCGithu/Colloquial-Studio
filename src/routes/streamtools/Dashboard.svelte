<script lang="ts">
  import { fly, fade, slide } from "svelte/transition";
  import { onMount, getContext } from "svelte";
  import { get } from "svelte/store";

  import { appInit, loadURL, urlBuild, storage, urlFill, dashReset } from "../toolParams";
  import Dash from "../../components/DashExport";
  import SVGIcon from "../../components/SVGIcon.svelte";
  import SaveMenu from "./saveMenu.svelte";
  import JSONCrush from "jsoncrush";
  import Noise from "../../components/Noise.svelte";
  import DashTab from "../../components/DashTab.svelte";

  //CONTEXT
  let appDetails: appDetails = getContext("appDetails");
  const toastUpdate: toastUpdate = getContext("toast");

  export let showInfo = false;
  export let showButtons = true;
  export let saves = [false, false, false];
  let showMenu = false;

  let baseURL = "";
  let userBackground = "#242423";

  let saveMenu = false;
  function toggleInfoScreen() {
    storage.update((currentStorage) => {
      currentStorage[appDetails.name].inProgress.intro = true;
      return currentStorage;
    });
    showInfo = !showInfo;
  }

  //URL FUNCTIONS
  function openURL() {
    let currentURL = get(urlFill)[appDetails.name].current;
    if (currentURL.length < 5) {
      toastUpdate("No URL generated yet!", "error");
      return;
    }
    window.open(currentURL);
  }

  function copyURL() {
    let currentURL = get(urlFill)[appDetails.name].current;
    navigator.clipboard.writeText(currentURL);
    toastUpdate("URL copied to clipboard", "info");
  }

  async function loadFromURL() {
    let urlData = window.prompt("Put in an existing URL", "URL here...");
    if (!urlData) return;
    await loadURL(urlData || "", appDetails.name);
    urlBuild(appDetails.name);
    toastUpdate("Settings loaded from URL", "pass");
  }

  onMount(async () => {
    //Pulling actual base URL
    baseURL = window.location.href.split("?data=")[0];
    let urlData = new URLSearchParams(window.location.search);
    if (urlData.has("data")) window.location.replace(`${window.location.href.split("?data")[0]}/app` + document.location.search);
    //EmoteDrop V1 Fix
    if (urlData.has("channel")) {
      let channelObj = {
        channel: urlData.get("channel"),
      };
      let crushed = JSONCrush.crush(JSON.stringify(channelObj));
      window.location.replace(`${window.location.href.split("?channel")[0]}/app?data=` + crushed);
    }
    urlFill.update((urls) => {
      urls[appDetails.name].base = baseURL;
      return urls;
    });
    setTimeout(() => {
      urlBuild(appDetails.name);
      if (!$storage[appDetails.name].inProgress.intro) showInfo = true;
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
      <h1>{appDetails.title}</h1>
      <p><span>{appDetails.description}</span></p>
      <div id="credits">
        <a href="https://docs.colloquial.studio/">Read the docs for more info</a>
        <span>
          <a aria-label="KoFi Link" href="https://ko-fi.com/K3K2231Z8" target="_blank" rel="noreferrer"><img src="https://storage.ko-fi.com/cdn/kofi3.png?v=3" alt="Buy Me a Coffee at ko-fi.com" /></a>
        </span>
      </div>
      <button class="closeButton" on:click={toggleInfoScreen} on:submit={toggleInfoScreen}>🗙</button>
    </div>
  </div>
{/if}
<main style:--userBackground={userBackground} class:blur={showInfo} class="addNoise">
  {#if saveMenu}
    <SaveMenu {saves} on:savemenu={() => (saveMenu = !saveMenu)} />
  {/if}
  <span id="return"><a aria-label="Return to home" href="/"><SVGIcon icon="logo" /></a></span>
  <div id="dashControls">
    <button class="titleButton" on:click={toggleInfoScreen}><h1>{appDetails.title}</h1></button>
    <slot {Dash} />
    <Dash.Button
      customClass="ResetText"
      background={false}
      hover={false}
      text="Reset to Default"
      on:click={() => {
        dashReset(appDetails.name);
      }}
    />
  </div>
  <div class="dashReact">
    <div id="dashTopBar" role="banner" on:mouseenter={() => (showButtons = true)} on:mouseleave={() => (showButtons = false)}>
      <div class="PopOver">
        <button class="PopOverButton" on:click={() => (showMenu = !showMenu)}><SVGIcon icon="settings" fill="hsl(40, 26%, 89%)" /> </button>
        {#if showMenu}
          <div class="PopOverPanel">
            <div class="panel-contents" transition:slide>
              <h4>Settings</h4>
              <button type="button" id="go" on:click={openURL}>Open Link</button>
              <button type="button" id="copy" on:click={copyURL}>Copy Link</button>
              <button type="button" id="load" on:click={loadFromURL}>Load existing URL</button>
              <button type="button" id="save" on:click={() => (saveMenu = !saveMenu)}>Saves</button>
              <div class="panelInput">
                <label for="userBackgroundColour">Background Colour</label>
                <input id="userBackgroundColour" type="color" bind:value={userBackground} />
              </div>
              <a href="https://docs.colloquial.studio/"><button id="docs">Documentation 🡥</button></a>
              <button type="button" on:click={toggleInfoScreen}>Info</button>
            </div>
          </div>
        {/if}
      </div>
      <input id="outputURL" placeholder="URL will be here!" type="text" bind:value={$urlFill[appDetails.name].current} />
    </div>
    <div id="dashApp">
      {#await appInit(toastUpdate)}
        <p>Loading</p>
      {:then run}
        <slot name="app" />
      {/await}
    </div>
  </div>
  <Noise />
</main>

<style lang="scss">
  @use "../../css/default.scss" as d;
  @use "../../css/colours.scss" as *;

  * {
    font-family: "Poppins";
  }

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
    @media screen and (max-width: d.$phone) {
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
    $mainEase: cubic-bezier(0.13, 1.08, 0.67, 1);
    transition:
      4s transform $mainEase,
      filter 4s $mainEase;
  }

  .titleButton {
    background-color: rgba(0, 0, 0, 0);
  }

  h1 {
    //font-weight: bold;
    position: relative;
    font-family: "Outfit";
    margin: 0;
    width: max-content;
    font-size: 3rem;
    font-weight: 800;
    margin: 0;
    padding: 0;
    margin-top: -1.5rem;
    margin-bottom: 0.3rem;
    //text-decoration: underline;
    //font-size: clamp(1rem, -0.1475rem + 2.623vw, 3rem);
    color: $white;
    text-decoration-color: $colloquial;
    line-height: 4rem;
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
    padding: 3rem 1rem 2rem 1.5rem;
    overflow-y: auto;
    overflow-x: hidden;
    scrollbar-gutter: stable;
    container-type: inline-size;

    @media only screen and (max-width: d.$phone) {
      padding: 3rem 1rem 1rem 1rem;
      height: 35vh;
      height: 35svh;
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
    overflow: hidden;
    z-index: 3;
    max-height: calc(100% - 4rem);
    width: calc(100% - 2rem);
    padding: 1rem;
  }

  .dashReact {
    height: 100vh;
    width: 67vw;
    display: flex;
    flex-direction: column;
    @media screen and (max-width: d.$phone) {
      width: 100vw;
      height: 50vh;
      min-height: 50vh;
      height: 50svh;
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
    background-color: fade-out(darken($black, 5), 0.3);
  }
  .infoBox {
    border-radius: 1rem;
    border: fade-out($whiteFade, 0.6) solid;
    border-width: 3px 3px 5px 3px;
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
  }

  :global(.closeButton) {
    position: absolute;
    right: 25px;
    top: 15px;
    font-size: 20px;
    font-weight: bold;
    border: none;
    background-color: transparent;
    color: $white;
    transition: 1s color;
    margin: -5px;
    padding: 0;
    cursor: pointer;
    &:hover {
      color: $colloquial;
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
    max-width: 90%;
    padding: 0.5rem 1rem;
    background-color: fade-out($white, 0.9);
    a {
      margin-top: 0.5rem;
      color: $white;
      text-decoration-color: $colloquial;
      transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
    }
    span {
      height: 40px;
      display: flex;
      flex-direction: row;
      justify-content: center;
      img {
        height: 100%;
      }
      a {
        padding: 0 0.2rem;
        &:hover {
          transform: scale(1.05) rotate(2deg);
        }
      }
    }
  }

  button {
    border: none;
    cursor: pointer;
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
  .PopOver {
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
  .PopOverButton {
    border: none;
    outline: none;
    border-radius: 1rem;
    background-color: transparent;
    //border-radius: 0.3rem;
    padding-top: 0.2rem;
    padding: 0rem;
    height: 100%;
    max-height: 2rem;
    margin-right: 0.5rem;
    width: 100%;
    fill: $white;
    position: relative;
    transition: all 0.4s cubic-bezier(0.34, 1.71, 0.37, 0.92);
    &:hover {
      transform: scale(1.1);
    }
    // Only keyboard focus
    &:focus-visible {
      border: solid 1px $white;
      transform: scale(1.1);
    }
    &:focus:not(:focus-visible) {
      border: none;
    }
    cursor: pointer;
  }
  .PopOverPanel {
    background-color: transparent;
    background-color: $whiteFade;
    border: solid $black;
    border-width: 3px 3px 5px 3px;
    top: calc(100% + 1.25rem);
    width: max-content;
    left: 0.25rem;
    padding-bottom: 0.3rem;
    position: absolute;
    z-index: 10;
    border-radius: 0.7rem;
  }
  .panel-contents {
    color: $black;
    a {
      text-decoration: none;
    }
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
      //width: calc(100% - 0.6rem);
      position: relative;
      display: flex;
      margin: 0 0.3rem;
    }
    button {
      font-size: 16px;
      width: calc(100% - 0.6rem);
      background-color: rgba(0, 0, 0, 0);
      margin: 0 0.3rem;
      position: relative;
      cursor: pointer;
      padding: 0.2rem 0.5rem;
      display: flex;
      flex-direction: row;
      border-radius: 0rem;
      transition: 0.3s padding-left ease-in-out;
      &:hover {
        color: white;
        //border-radius: 1rem;
        padding-left: 0.7rem;
        padding-right: 0.3rem;
        background-color: fade-out(lighten($black, 10), 0.2);
      }
    }
    input {
      position: absolute !important;
      top: 0;
      left: 0;
      cursor: pointer;
      width: 100%;
      height: 100%;
      padding: 0 !important;
      overflow: hidden;
      box-shadow: none !important;
      background-color: transparent;
      border: none !important;
      border-color: transparent;
      border-radius: 0 !important;
      &:hover {
        outline: none;
        border: none !important;
      }
      &::-webkit-color-swatch-wrapper {
        visibility: hidden;
        height: 100%;
        width: 100%;
        position: absolute;
        left: 0;
        top: 0;
        background-color: transparent;
      }
    }
  }
  .panelInput {
    label {
      pointer-events: none;
      z-index: 10;
    }
    position: relative;
    transition: 0.3s padding ease-in-out;
    padding: 0.2rem 0.5rem;
    &:hover {
      color: white;
      padding-left: 0.7rem;
      padding-right: 0.3rem;
      background-color: fade-out(lighten($black, 10), 0.2);
    }
  }

  ::-webkit-color-swatch,
  ::-webkit-color-swatch-wrapper {
    border: none;
    padding: 0;
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
    z-index: 10;
    @media screen and (max-width: d.$phone) {
      margin: 12px 0px 0px 12px;
      width: 20px;
      height: 20px;
    }
    &:hover {
      opacity: 1;
    }
  }

  :global(.ResetText) {
    border: none !important;
    opacity: 0.4;
    background: none;
    &:hover {
      opacity: 0.6;
      text-decoration: underline;
      transform: none !important;
      border: none;
    }
  }
</style>
