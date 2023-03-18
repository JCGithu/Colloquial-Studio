<script lang="ts">
  //Functions
  import { onMount, setContext } from "svelte";
  import { slide } from "svelte/transition";
  import * as twordle from "./twFunctions";
  import { storage } from "./twFunctions";
  import "../../../js/tmi";
  //Components
  import { Switch } from "@rgossiaux/svelte-headlessui";
  import Darkmode from "./darkmode.svelte";
  import Keyboard from "./keyboard.svelte";
  import Grid from "./grid.svelte";
  import EventBox from "./eventBox.svelte";
  import Settings from "./settings.svelte";
  import HowTo from "./howTo.svelte";
  import Stats from "./stats.svelte";
  //AUDIO
  let winSound: HTMLAudioElement;
  let roundStart: HTMLAudioElement;
  import roundStartSrc from "./round.mp3";
  import winSoundSrc from "./win.mp3";
  import JSConfetti from "js-confetti";
  //Variables
  let userEmote: undefined | string = undefined;
  //Overlays
  let confetti: JSConfetti;
  let canvas: HTMLCanvasElement;

  //Create Poll
  let poll: TwordlePoll = Object.assign({}, twordle.emptyPoll);
  let usersVoted: Array<string> = [];
  let currentGame: TwordleGame = {
    round: -1,
    letter: -1,
    timer: 0,
    votes: 0,
    message: "",
    guess: [[], [], [], [], [], []],
    answer: "",
    state: "START",
    connected: false,
    settings: false,
    howto: false,
    stats: false,
  };
  setContext("currentGame", currentGame);

  //TOAST
  let toastID = 0;
  let toastArray: Array<toast> = [];
  function ToastQueue(message: string, code?: string) {
    console.log(message);
    toastID++;
    toastArray.push({ message: message, id: toastID, code: code || undefined });
    toastArray = toastArray;
    setTimeout(() => {
      toastArray.shift();
      toastArray = toastArray;
    }, 5000);
  }
  const toastPopUp = (i: string) => {
    ToastQueue(i);
  };
  function toastDispatch({ detail }: { detail: { message: string; code: string } }) {
    ToastQueue(detail.message, detail.code);
  }
  //GAME LOOP
  //START - This is not specified if it's random or not now - need to fix that dispatch up
  // THIS Needs to check if we're connected or not as well.
  //ROUND STARTING - 3 Second countdown
  //ROUND RUN - A timer length countdown that runs the poll
  //ROUND SUMMARY - BRANCHES OUT
  // DRAW - Make button go back to roundstarting;
  // NO ENTER - Make button go back to round starting;
  // ROUND DONE - Up the letter count, add to grid, make button start round;
  // ROW DONE - Reveal word

  function wrapUpLine() {
    console.log(currentGame);
    let roundGuess = currentGame.guess[currentGame.round].join("");
    console.log(roundGuess);
    if (roundGuess === currentGame.answer) {
      // Success
      currentGame.state = "SUCCESS";
      twordle.incrementStat("won", 1);
      currentGame.round++;
      currentGame.letter++;
      confetti.addConfetti();
      winSound.play();
    } else if (currentGame.round != 5) {
      // Next Line
      currentGame.state = "NEXTLINE";
      currentGame.round++;
      currentGame.letter = 0;
      console.log("Changing to Next Line");
    } else {
      // Fail
      currentGame.round++;
      currentGame.state = "FAIL";
    }
  }

  function finishPoll() {
    let finalPoll = Object.assign({}, poll);
    let finalResult = twordle.getMax(finalPoll);
    twordle.incrementStat("votes", usersVoted.length);
    poll = Object.assign({}, twordle.emptyPoll);
    // REDO
    if (finalPoll[finalResult[0]] === 0) {
      console.log("No One Entered?");
      currentGame.state = "RETRY";
      currentGame.message = `No one entered! Redo?`;
    } else if (finalResult.length > 1) {
      currentGame.state = "RETRY";
      currentGame.message = `${finalResult.join(", ")} with ${finalPoll[finalResult[0]]} votes.`;
    }
    //CONTINUE
    if (finalResult.length === 1) {
      currentGame.state = "NEXTROUND";
      currentGame.message = `${finalResult[0]} won with ${finalPoll[finalResult[0]]} votes.`;
      currentGame.guess[currentGame.round].push(finalResult[0]);
      twordle.gridUpdate(currentGame, finalResult[0]);
      // NEXT LINE
      if (currentGame.letter === 4) {
        currentGame.state = "REVEAL";
      } else {
        currentGame.letter++;
      }
      console.log("Current game state is ", currentGame.state);
    }
  }

  function startPoll() {
    if (currentGame.state === "POLL") return;
    currentGame.state = "POLL";
    currentGame.timer = $storage.timer;
    roundStart.play();
    var roundClock = setInterval(function () {
      --currentGame.timer;
      currentGame.message = usersVoted.length + " votes";
      if (currentGame.timer === 0) {
        clearInterval(roundClock);
        finishPoll();
      }
    }, 1000);
  }

  function newLetterRound() {
    console.log("Starting new round");
    usersVoted = [];
    currentGame.timer = 4;
    currentGame.votes = 0;
    let preroundTimer = setInterval(function () {
      console.log("countdown timer");
      --currentGame.timer;
      currentGame.state = "OPENING";
      if (currentGame.timer === 1) {
        clearInterval(preroundTimer);
        startPoll();
      }
    }, 1000);
  }

  function buttonPress() {
    console.log("Current game state is ", currentGame.state);
    if (["START", "NEXTROUND", "NEXTLINE", "RETRY"].includes(currentGame.state)) {
      console.log("Running New round");
      newLetterRound();
    }
    if (currentGame.state === "REVEAL") wrapUpLine();
  }

  function darkToggle({ detail }: { detail: boolean }) {
    twordle.changeSetting("dark", detail);
  }

  onMount(() => {
    //LocalStorage
    let existingStorage = window.localStorage.twordle;
    if (existingStorage) {
      existingStorage = JSON.parse(existingStorage);
      console.log(existingStorage);
      twordle.storage.set(existingStorage);
    } else {
      currentGame.howto = true;
    }
    twordle.storage.subscribe((value) => (window.localStorage.twordle = JSON.stringify(value)));

    //LANGUAGES
    let languageCode = navigator.language.substring(0, 2);
    if (Object.keys(twordle.languageList).includes(languageCode)) {
      twordle.language.set(languageCode);
    }

    confetti = new JSConfetti({ canvas });

    //if (onMobile) localKeyboard = false;

    //@ts-ignore
    let client = new tmi.Client({
      channels: [$storage.channel],
    });

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
      currentGame.connected = true;
      toastPopUp(`Connected to ${$storage.channel} chat`);
    });

    client.on("message", (channel: string, tags: Tags, message: string, self: boolean) => {
      if (message.length > 1) return;
      if (usersVoted.includes(tags.username)) return;
      message = message.replace("ß", "ẞ");
      let upper = message.toUpperCase();
      let characterCode = upper.charCodeAt(0);
      if (twordle.characterChecker(characterCode)) {
        ++poll[upper];
        ++currentGame.votes;
        usersVoted.push(tags.username);
        console.log(`${tags.username} has voted!`);
      }
    });

    if ($storage.channel || $storage.channel != "") {
      client.connect();
    }
  });
</script>

<svelte:head>
  <title>Twordle</title>
  <style>
    body {
      width: 100vw;
      height: 100vh;
      padding: 0;
      margin: 0;
      overflow: hidden;
    }
  </style>
</svelte:head>

<main class="twordleShades {$storage.dark ? 'twordleDark' : 'twordleLight'}">
  <div id="toastBox">
    {#each toastArray as toasty (toasty.id)}
      <div out:slide class="toast {toasty.code}">
        {toasty.message}
      </div>
    {/each}
  </div>
  <audio bind:this={winSound} src={winSoundSrc} volume={$storage.volume / 10} />
  <audio bind:this={roundStart} src={roundStartSrc} volume={$storage.volume / 10} />
  <canvas id="confetti" bind:this={canvas} />
  {#if currentGame.settings || currentGame.howto || currentGame.stats}
    <div id="overlay">
      {#if currentGame.settings}
        <Settings on:close={() => (currentGame.settings = false)} />
      {:else if currentGame.howto}
        <HowTo on:close={() => (currentGame.howto = false)} />
        <p>HELLO</p>
      {:else if currentGame.stats}
        <Stats on:close={() => (currentGame.stats = false)} />
      {/if}
    </div>
  {/if}
  <div class="menu">
    <Switch checked={$storage.dark} on:change={darkToggle} class={$storage.dark ? "switch switch-enabled" : "switch switch-disabled"}>
      <span class="sr-only">Enable notifications</span>
      <span class="toggle {$storage.dark ? 'toggle-on' : 'toggle-off'}" />
      <p>{$storage.dark}</p>
    </Switch>
    <Darkmode />
    <svg id="cog" on:click={() => (currentGame.settings = !currentGame.settings)} xmlns="http://www.w3.org/2000/svg" viewBox="0 -256 1792 1792">
      <path
        d="M1024 640q0 106-75 181t-181 75q-106 0-181-75t-75-181q0-106 75-181t181-75q106 0 181 75t75 181zm512 109V527q0-12-8-23t-20-13l-185-28q-19-54-39-91 35-50 107-138 10-12 10-25t-9-23q-27-37-99-108t-94-71q-12 0-26 9l-138 108q-44-23-91-38-16-136-29-186-7-28-36-28H657q-14 0-24.5 8.5T621-98L593 86q-49 16-90 37L362 16q-10-9-25-9-14 0-25 11-126 114-165 168-7 10-7 23 0 12 8 23 15 21 51 66.5t54 70.5q-27 50-41 99L29 495q-13 2-21 12.5T0 531v222q0 12 8 23t19 13l186 28q14 46 39 92-40 57-107 138-10 12-10 24 0 10 9 23 26 36 98.5 107.5T337 1273q13 0 26-10l138-107q44 23 91 38 16 136 29 186 7 28 36 28h222q14 0 24.5-8.5T915 1378l28-184q49-16 90-37l142 107q9 9 24 9 13 0 25-10 129-119 165-170 7-8 7-22 0-12-8-23-15-21-51-66.5t-54-70.5q26-50 41-98l183-28q13-2 21-12.5t8-23.5z"
        style="fill:white"
        transform="matrix(1 0 0 -1 121.492 1285.424)"
      /></svg
    >
    <svg id="stats" on:click={() => (currentGame.stats = !currentGame.stats)} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 490.4 490.4" xml:space="preserve"
      ><path
        d="M17.2 251.55c-9.5 0-17.2 7.7-17.2 17.1v179.7c0 9.5 7.7 17.2 17.2 17.2h113c9.5 0 17.1-7.7 17.1-17.2v-179.7c0-9.5-7.7-17.1-17.1-17.1h-113zm95.8 179.7H34.3v-145.4H113v145.4zm377.4 17.2v-283.7c0-9.5-7.7-17.2-17.2-17.2h-113c-9.5 0-17.2 7.7-17.2 17.2v283.6c0 9.5 7.7 17.2 17.2 17.2h113c9.5 0 17.2-7.7 17.2-17.1zm-34.3-17.2h-78.7v-249.3h78.7v249.3zm-154.4 34.3c9.5 0 17.1-7.7 17.1-17.2V42.05c0-9.5-7.7-17.2-17.1-17.2h-113c-9.5 0-17.2 7.7-17.2 17.2v406.3c0 9.5 7.7 17.2 17.2 17.2h113zm-95.8-406.3h78.7v372h-78.7v-372z"
        style="fill:#fff"
      /><g /><g /><g /><g /><g /><g /><g /><g /><g /><g /><g /><g /><g /><g /><g /></svg
    >
  </div>
  <div id="twordleBody" class:blurred={currentGame.howto || currentGame.settings || currentGame.stats}>
    <div id="twordle">
      <div class="Title">
        <span class="personalised">
          {#if !userEmote}
            <h1>Twordle</h1>
          {:else}
            <h1>Tw</h1>
            <img style="height:2em" alt="emote" src={userEmote} />
            <h1>rdle</h1>
          {/if}
        </span>
        <p>Made by <a aria-label="Twitch Account" href="https://www.twitch.tv/colloquialowl">ColloquialOwl</a>, Inspired by <a href="https://www.powerlanguage.co.uk/wordle/">Wordle</a>.</p>
        <button on:click={() => (currentGame.howto = !currentGame.howto)}>How to Play</button>
      </div>
      <Grid {currentGame} />
      <div id="bottom">
        <Keyboard {currentGame} />
        <EventBox {currentGame} on:toast={toastDispatch} on:buttonPress={buttonPress} />
      </div>
    </div>
  </div>
</main>

<style lang="scss">
  @import "../../../css/colours.scss";
  :global(.twordleDark) {
    --main: #232323;
    --titleShadow: none;
    --text: white;
  }
  :global(.twordleLight) {
    --main: #e2c293;
    --titleShadow: 1px 1px 0px white, 2px 2px 0px white;
    --text: white;
  }
  :global(.twordleShades) {
    --mainDarken5: #ddb77f;
    --mainDarken10: #d7ab6b;
    --mainDarken15: #d2a057;
    --mainDarken20: #cc9543;
    --mainDarken40: #855e24;
    --mainLighten10: #edd9bb;
    --mainLighten15: #f2e4cf;
  }
  main {
    font-family: "Poppins";
    background-color: var(--main);
  }
  canvas {
    width: 100vw;
    height: 100vh;
    position: absolute;
  }
  #twordleBody {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    overflow: hidden;
    background-color: var(--main);
    transition: all 500ms ease-in-out;
  }

  #twordle {
    overflow-y: hidden;
    height: 96vh;
    width: 100vw;
    @media only screen and (max-height: "900px") {
      height: 100vh;
    }
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    //transform: scale(1.1);
    //background-color: black;
    transition: all 0.1s ease-in-out;
  }

  @keyframes highlightScale {
    from {
      transform: scale(1);
      border-width: 3px;
    }
    to {
      transform: scale(1.05);
      border-width: 4px;
    }
  }

  .Title {
    position: relative;
    max-height: 115px;
    display: flex;
    flex-direction: column;
    padding-bottom: 1vh;
    justify-content: flex-end;
    text-align: center;
    font-weight: 600;
    font-size: clamp(0.3rem, 2vh, 1rem);
    a {
      color: $twordlePurple;
      text-decoration: none !important;
      text-shadow: none;
    }
    button {
      padding: 0rem 0rem;
      margin: 0.3rem 0rem;
      background-color: var(--mainDarken15);
      cursor: pointer;
    }
    p {
      margin: 0;
    }
    h1 {
      color: $twordlePurple;
      text-align: center;
      text-shadow: none;
      font-size: clamp(1rem, 4vh, 3rem);
      font-weight: bold;
      text-shadow: var(--titleShadow);
      margin: 0;
    }
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
    a {
      text-decoration: underline;
    }
  }

  button {
    border: none;
    padding: 2rem;
    color: var(--text);
    font-weight: 500;
    font-family: "Poppins";
  }

  #bottom {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: max-content;
    @media only screen and (max-height: "830px") {
      flex-direction: row;
    }
  }

  #voted {
    position: absolute;
    background-color: var(--mainLighten10);
    border-radius: 1rem;
    padding: 0.5rem;
    margin-left: 1.5rem;
    margin-top: 1.5rem;
    visibility: hidden;
    font-size: smaller;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
    color: $twordlePurple;
  }

  #popup {
    position: absolute;
    width: 100vw;
    height: 100vh;
    top: 0;
    left: 0;
    padding: 0;
    margin: 0;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
    background-color: fade-out(black, 0.5);
  }

  //TOAST
  #toastBox {
    position: absolute;
    height: max-content;
    left: 0;
    top: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-direction: column;
    pointer-events: none;
  }

  .toast {
    background-color: $twordleGreen;
    color: white;
    padding: 0rem 1rem;
    margin: 0.5rem;
    border-radius: 0.5rem;
    z-index: 10;
    transition: 0.25s all;
    animation: slideIn 0.3s cubic-bezier(0.19, 1.38, 0.46, 0.94);
    &:hover {
      opacity: 0.6;
    }
    &.error {
      background-color: $colloquial;
    }
  }
  @keyframes slideIn {
    from {
      transform: translateX(-200px);
    }
    to {
      transform: translateX(0px);
    }
  }

  .personalised {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(45deg);
    }
  }

  #overlay {
    position: absolute;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu {
    width: max-content;
    height: 1.6rem;
    top: 0.5rem;
    right: 0.7rem;
    position: absolute;
    z-index: 1;
    background-color: var(--mainDarken15);
    padding: 0.3rem;
    border-radius: 0.3rem;
    svg {
      pointer-events: all;
      cursor: pointer;
      width: 1.6rem;
      path {
        fill: $white;
      }
    }
    #cog {
      &:hover {
        animation: spin 1s ease-out;
        animation-iteration-count: infinite;
      }
    }
  }

  .revealed {
    background-color: var(--mainDarken40) !important;
  }
  .blurred {
    filter: blur(5px) brightness(0.8);
  }

  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  .toggle {
    display: inline-block;
    width: 1rem;
    height: 1rem;
    background-color: $white;
    border-radius: 9999px;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .toggle-on {
    transform: translateX(1.1rem);
  }

  .toggle-off {
    transform: translateX(-0.25rem);
  }
</style>
