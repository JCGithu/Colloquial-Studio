<script lang="ts">
  import "../../../js/tmi";
  import { onMount } from "svelte";
  import { fly } from "svelte/transition";
  import JSConfetti from "js-confetti";
  let channel = "";
  let canvas: HTMLCanvasElement;

  let startNum = 65;
  let currNum = 64;
  let done = false;
  let userList: Array<string> = [];
  let easyMode = false;
  let highscore = 0;
  let attempts = 0;
  let intro = false;

  let blurry = false;
  let red = false;
  let shake = false;
  let overlay = false;

  let mainText = "...";
  let userText = "";
  let extraText: string | null = null;

  let channelInput: string;
  function reloadGame() {
    let baseURL = window.location.href;
    window.location.replace(`${baseURL}?channel=${channelInput}&overlay=${overlay}`);
  }

  function fail(username: string) {
    (red = true), (shake = true);
    mainText = "...";
    userList = [];
    console.log(currNum, highscore);
    if (currNum > highscore) {
      highscore = currNum;
      attempts = -1;
    }
    attempts++;
    let attemptText = "";
    if (attempts) attemptText = "\n" + attempts + " attempts ago";
    if (highscore > 64) userText = "Reached " + String.fromCharCode(highscore) + attemptText;
    if (currNum > 64) extraText = `Broken by: ${username}`;
    currNum = startNum - 1;
    setTimeout(() => ((red = false), (shake = false)), 1000);
  }

  function success(confetti: JSConfetti) {
    mainText = "Z";
    extraText = "ALPHABET COMPLETE!";
    userText = "Thanks to the work of " + userList.join(", ");
    confetti.addConfetti();
    done = true;
  }

  function runMessage(channel: string, tags: Tags, message: string, confetti: JSConfetti) {
    if (done) return;
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
      if (currNum === 90) success(confetti);
    } else fail(tags.username);
  }

  onMount(() => {
    let URldata = new URLSearchParams(window.location.search);
    channel = URldata.get("channel") || "";
    overlay = URldata.get("overlay") === "true" || false;

    const jsConfetti = new JSConfetti({ canvas });

    //@ts-ignore
    let client = new tmi.Client({
      channels: [channel],
    });

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
    });

    function handleEvent(channel: string, tags: Tags, message: string) {
      runMessage(channel, tags, message, jsConfetti);
    }
    client.on("chat", handleEvent);
    client.on("action", handleEvent);
    client.on("cheer", handleEvent);
    client.on("subscription", (channel: string, username: string, method: string, message: string, tags: Tags) => handleEvent(channel, tags, message));
    client.on("resub", (channel: string, username: string, months: number, message: string, tags: Tags, methods: string) => handleEvent(channel, tags, message));

    // ADD WAY FOR EASY AND OVERLAY MODE
    if (channel != "") {
      client.connect();
      intro = true;
    }
  });
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
  {#if intro}
    <canvas bind:this={canvas} />
    <div id="game">
      {#if highscore <= 0}<p>Current letter:</p>{/if}
      <h2 id="current" class:shake>{mainText}</h2>
      <p id="users">{userText}</p>
      {#if extraText}<p id="extra" transition:fly={{ y: 200, duration: 500 }}>{extraText}</p>{/if}
    </div>
  {:else}
    <div class:blurry>
      <h1 id="title">Alphabet Challenge</h1>
      <h4 id="credit">Original idea by <a href="https://www.twitch.tv/Lenamoon">Lenamoon</a>, made by <a href="https://www.twitch.tv/colloquialowl">ColloquialOwl</a></h4>
      <p>In order to play with chat you'll need to put in your channel below</p>
    </div>
    <input type="text" on:blur={() => (blurry = false)} on:focus={() => (blurry = true)} bind:value={channelInput} />
    <label class:blurry>
      {overlay ? "Transparent background" : "Original background"}
      <input type="checkbox" bind:checked={overlay} />
    </label>
    <button class:blurry on:click={reloadGame}>Play</button>
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
  .blurry {
    filter: blur(5px);
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
    font-size: small;
  }
  #current {
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
  input[type="checkbox"] {
    padding: 0.7rem 3rem;
    border-radius: 0.5rem;
    border: none;
    outline: none;
    appearance: none !important;
    //margin-top: 1rem;
    font-family: "Poppins";
    height: 1rem;
    opacity: 0;
    &:hover {
      opacity: 0;
    }
  }
  label {
    margin-top: 0.5rem;
    padding: 0.3rem 2rem;
    background-color: rgba(256, 0, 0, 0.2);
    text-align: center;
    border-radius: 0.5rem;
    transition: all 0.3s ease-in-out;
    cursor: pointer;
    &:hover {
      background-color: rgba(256, 0, 0, 0.3);
    }
    input {
      position: absolute;
    }
  }
  button {
    outline: none;
    margin: 0.5rem;
    font-family: "Poppins";
    background-color: black;
    color: white;
    border-radius: 0.5rem;
    cursor: pointer;
  }
</style>
