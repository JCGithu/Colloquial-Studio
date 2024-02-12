<script lang="ts">
  import "../../../js/tmi";
  import { onMount } from "svelte";
  import { fly, fade } from "svelte/transition";
  import JSConfetti from "js-confetti";
  import type { Client } from "tmi.js";
  import { beforeNavigate } from "$app/navigation";
  import DashCheck from "../../../components/DashCheck.svelte";
  let channel = "";
  let channelInput: string;
  let canvas: HTMLCanvasElement;
  let confettiTarget: JSConfetti;

  // Starting Variables
  let startNum = 65;
  let currNum = 64;

  //Game Data
  let userList: Array<string> = [];
  let highscore = 0;
  let attempts = 0;

  //Settings
  let playGame = 0;
  let done = false;
  let easyMode = false;
  let alphabetBlurry = false;
  let red = false;
  let shake = false;
  let overlay = false;

  //Text Interface
  let mainText = "...";
  let userText = "";
  let extraText: string | null = null;

  function reloadGame() {
    let baseURL = window.location.href;
    window.location.replace(`${baseURL}?channel=${channelInput}&overlay=${overlay}`);
  }

  function success() {
    mainText = "Z";
    extraText = "ALPHABET COMPLETE!";
    userText = "Thanks to the work of " + userList.join(", ");
    confettiTarget.addConfetti();
    done = true;
  }

  function fail(username: string) {
    (red = true), (shake = true);
    mainText = "...";
    userList = [];
    console.log(currNum, highscore);
    if (currNum >= highscore) {
      highscore = currNum;
      attempts = 0;
    }
    attempts++;
    if (highscore > 64) userText = "Reached " + String.fromCharCode(highscore) + (attempts ? `\n ${attempts} attempts ago` : "");
    if (currNum > 64) extraText = `Broken by: ${username}`;
    currNum = startNum - 1;
    setTimeout(() => ((red = false), (shake = false)), 1000);
  }

  function runMessage(channel: string, tags: Tags, message: string, misc: { [x: string]: any }) {
    if (message.length > 1) return fail(tags.username);
    message = message.toUpperCase();
    if (currNum === 64 && message === "A") {
      if (!userList.includes(tags.username)) userList.push(tags.username);
      mainText = "A";
      currNum++;
      extraText = null;
      return;
    }
    let target = currNum + 1;
    if (easyMode && message.charCodeAt(0) == target - 1) {
      extraText = `Close one ${tags.username}...`;
    } else if (message.charCodeAt(0) == target) {
      currNum++;
      mainText = String.fromCharCode(currNum);
      if (currNum === 90) success();
    } else fail(tags.username);
  }

  function deBlur(k: KeyboardEvent) {
    if (k.key != "Enter") return;
    alphabetBlurry = false;
    let button = document.getElementById("button");
    button ? button.focus() : document.body.focus();
  }

  let client: Client;
  onMount(() => {
    let URldata = new URLSearchParams(window.location.search);
    channel = URldata.get("channel") || "";
    playGame = channel.length ? 1 : 2;
    overlay = URldata.get("overlay") === "true" || false;

    confettiTarget = new JSConfetti({ canvas });

    //@ts-ignore
    client = new tmi.Client({
      channels: [channel],
    });
    client.on("connected", () => console.log("Reading from Twitch! ✅"));
    client.on("chat", (channel, tags, message, self) => runMessage(channel, tags, message, { self }));
    client.on("action", (channel, tags, message, self) => runMessage(channel, tags, message, { self }));
    client.on("cheer", (channel, tags, message) => runMessage(channel, tags, message, { self }));
    client.on("subscription", (channel, username, method, message, tags) => runMessage(channel, tags, message, { username, method }));
    client.on("resub", (channel, username, months, message, tags) => runMessage(channel, tags, message, { username, months }));

    // ADD WAY FOR EASY AND OVERLAY MODE
    if (channel.length) {
      client.connect();
      playGame = 1;
    }
  });

  function disconnectChat() {
    if (!client) return;
    client.disconnect().catch((error: string) => {
      console.log(error);
    });
  }
  beforeNavigate(disconnectChat);
</script>

<svelte:head>
  <title>Alphabet - Colloquial</title>
  <style>
    body {
      width: 100vw;
      height: 100vh;
      margin: 0;
      padding: 0;
      overflow: hidden;
    }
  </style>
</svelte:head>

<main class:red class:overlay>
  {#if playGame === 1}
    <canvas bind:this={canvas} />
    <div id="game">
      {#if highscore <= 0}<p>Current letter:</p>{/if}
      <h2 id="current" class:shake style:--increase="{100 + (currNum - 64) / 10}%">{mainText}</h2>
      {#if currNum < highscore}<p id="users" transition:fade>{userText}</p>{/if}
      {#if extraText}<p id="extra" transition:fly={{ y: 200, duration: 500 }}>{extraText}</p>{/if}
    </div>
  {:else if playGame === 2}
    <div class:alphabetBlurry>
      <h1 id="title">Alphabet Challenge</h1>
      <h4 id="credit">Original idea by <a href="https://www.twitch.tv/Lenamoon">Lenamoon</a>, made by <a href="https://www.twitch.tv/colloquialowl">ColloquialOwl</a></h4>
      <p>In order to play with chat you'll need to put in your channel below</p>
    </div>
    <input type="text" on:keypress={deBlur} on:blur={() => (alphabetBlurry = false)} on:focus={() => (alphabetBlurry = true)} bind:value={channelInput} />
    <div class="checkDiv">
      <DashCheck customClass={alphabetBlurry ? "alphabetBlurry alphabetCheck" : "alphabetCheck"} name="No Background" bind:value={overlay} />
    </div>
    <button id="button" class:alphabetBlurry on:click={reloadGame}>Play</button>
  {/if}
</main>

<style lang="scss">
  @use "../../../css/colours.scss" as *;

  main {
    display: flex;
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow: hidden;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-family: "Poppins", sans-serif;
    background-color: #ead2ac;
    transition: all 0.2s ease-in-out;
  }
  a {
    color: $colloquial;
    text-decoration: none;
  }
  #game {
    position: absolute;
    top: calc(50% - 3rem);
  }
  .red {
    background-color: red;
    color: white;
  }
  .overlay {
    background-color: rgba(0, 0, 0, 0) !important;
    input {
      background: black;
      color: white;
    }
  }

  :global(.alphabetBlurry) {
    filter: blur(5px);
  }
  :global(h2.alphabetCheck) {
    font-size: 1rem !important;
    color: $colloquial !important;
  }
  :global(span.alphabetCheck) {
    border-color: $colloquial !important;
    background-color: transparent !important;
    &::after {
      color: black !important;
    }
  }
  .checkDiv {
    width: calc(200px + 3rem);
  }
  .shake {
    animation: shake 0.82s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
    transform: translate3d(0, 0, 0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  @keyframes shake {
    10%,
    90% {
      transform: translate3d(-1px, 0, 0);
    }

    20%,
    80% {
      transform: translate3d(2px, 0, 0);
    }

    30%,
    50%,
    70% {
      transform: translate3d(-4px, 0, 0);
    }

    40%,
    60% {
      transform: translate3d(4px, 0, 0);
    }
  }

  h1 {
    margin: 0.5rem;
  }
  h4 {
    margin: 0;
    margin-top: -0.2rem;
    margin-bottom: 0.5rem;
    font-size: 1rem !important;
    font-size: small;
  }
  #current {
    --increase: 0.1%;
    font-size: 4rem;
    margin: 1rem;
    transition: all 0.5s cubic-bezier(0.075, 0.82, 0.165, 1);
  }
  #current:hover {
    transform: scale(1.02);
  }
  #extra {
    min-height: 2rem;
  }
  p {
    text-align: center;
    padding: 0;
    margin: 0;
  }
  #users {
    min-height: 2rem;
    white-space: pre-wrap;
  }
  h1 {
    text-decoration: underline;
    text-decoration-color: $colloquial;
  }
  div {
    justify-content: center;
    align-items: center;
    display: flex;
    flex-direction: column;
    text-align: center;
    width: max-content;
  }
  input[type="text"] {
    padding: 0.7rem 3rem;
    border-radius: 0.5rem;
    border: none;
    margin-top: 1rem;
    width: 200px;
    font-family: "Poppins";
    height: 1.5rem;
    opacity: 0.6;
    text-align: center;
    transition: all 0.3s cubic-bezier(0.19, 1.2, 0.46, 0.9);
    filter: blur(0) !important;
    -webkit-font-smoothing: subpixel-antialiased;
    backface-visibility: hidden;
    z-index: 2;
    &:hover {
      opacity: 1;
    }
    &:focus {
      border: none;
      outline: none;
      height: 3rem;
      zoom: 150%;
      transform: scale(1.5);
      opacity: 1;
    }
  }
  button {
    outline: none;
    margin: 0.5rem;
    font-family: "Poppins";
    border: none;
    background-color: black;
    color: white;
    padding: 0.3rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
  }
</style>
