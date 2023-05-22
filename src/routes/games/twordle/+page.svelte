<script lang="ts">
  //Functions
  import { onMount } from "svelte";
  import { slide } from "svelte/transition";
  import * as twordle from "./twFunctions";
  import { storage, currentGame } from "./twFunctions";
  import "../../../js/tmi";
  //Components
  import SVGIcon from "../../SVGIcon.svelte";
  import Keyboard from "./keyboard.svelte";
  import Grid from "./grid.svelte";
  import EventBox from "./eventBox.svelte";
  //AUDIO
  let winSound: HTMLAudioElement;
  let roundStart: HTMLAudioElement;
  import roundStartSrc from "./round.mp3";
  import winSoundSrc from "./win.mp3";
  import JSConfetti from "js-confetti";
  import Overlay from "./overlay.svelte";
  //Variables
  let userEmote: undefined | string = undefined;
  //Overlays
  let confetti: JSConfetti;
  let canvas: HTMLCanvasElement;

  //Create Poll
  let poll: TwordlePoll = Object.assign({}, twordle.emptyPoll);
  let usersVoted: Array<string> = [];

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

  function finishPoll() {
    let finalPoll = Object.assign({}, poll);
    let finalResult = twordle.getMax(finalPoll);
    twordle.incrementStat("votes", usersVoted.length);
    poll = Object.assign({}, twordle.emptyPoll);
    // REDO
    if (finalPoll[finalResult[0]] === 0) {
      twordle.changeState("RETRY");
      twordle.updateGame("message", `No one entered! Redo?`);
    } else if (finalResult.length > 1) {
      twordle.changeState("RETRY");
      twordle.updateGame("message", `${finalResult.join(", ")} with ${finalPoll[finalResult[0]]} votes.`);
    }
    //CONTINUE
    if (finalResult.length === 1) {
      twordle.changeState("NEXTROUND");
      twordle.updateGame("message", `${finalResult[0]} won with ${finalPoll[finalResult[0]]} votes.`);
      twordle.gridLetterUpdate(finalResult[0]);
      // NEXT LINE
      if ($currentGame.letter === 4) {
        twordle.changeState("REVEAL");
      } else {
        twordle.incrementGame({ letter: 1, round: 0, votes: 0 });
      }
    }
  }

  function startPoll() {
    if ($currentGame.state === "POLL") return;
    twordle.changeState("POLL");
    twordle.updateGame("timer", $storage.timer);
    roundStart.play();
    var roundClock = setInterval(function () {
      twordle.updateGame("timer", $currentGame.timer - 1);
      $currentGame.message = usersVoted.length + " votes";
      if ($currentGame.timer === 0) {
        clearInterval(roundClock);
        finishPoll();
      }
    }, 1000);
  }

  function newLetterRound() {
    console.log("Starting new round");
    usersVoted = [];
    twordle.updateGame("timer", 4);
    twordle.incrementGame({ round: 0, letter: 0, votes: -1 });
    twordle.changeState("OPENING");
    let preroundTimer = setInterval(function () {
      twordle.updateGame("timer", $currentGame.timer - 1);
      if ($currentGame.timer === 0) {
        clearInterval(preroundTimer);
        startPoll();
      }
    }, 1000);
  }

  function buttonPress() {
    if ($currentGame.state === "REVEAL") {
      twordle.updateGuess();
      if ($currentGame.currentGuess === $currentGame.answer) {
        // Success
        twordle.incrementStat("won", 1);
        twordle.incrementGame({ round: 1, letter: 1, votes: 0 });
        confetti.addConfetti();
        winSound.play();
      } else if ($currentGame.round != 5) {
        twordle.changeState("NEXTLINE");
        twordle.incrementGame({ round: 1, letter: -1, votes: 0 });
      } else {
        // Fail
        twordle.incrementGame({ round: 1, letter: 0, votes: 0 });
        twordle.changeState("FAIL");
      }
    } else {
      newLetterRound();
    }
  }

  onMount(() => {
    //LocalStorage
    let existingStorage = window.localStorage.twordle;
    if (existingStorage) {
      existingStorage = JSON.parse(existingStorage);
      twordle.storage.set(existingStorage);
    } else {
      twordle.updateGame("menu", 1);
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
      twordle.updateGame("connected", true);
      toastPopUp(`Connected to ${$storage.channel} chat`);
    });

    client.on("message", (channel: string, tags: Tags, message: string, self: boolean) => {
      if (self || !channel || message.length > 1 || usersVoted.includes(tags.username)) return;
      message = message.replace("ß", "ẞ");
      let upper = message.toUpperCase();
      let characterCode = upper.charCodeAt(0);
      if (twordle.characterChecker(characterCode)) {
        ++poll[upper];
        twordle.incrementGame({ votes: 1, letter: 0, round: 0 });
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
      overflow: hidden;
    }
  </style>
</svelte:head>

<main class={$storage.dark ? "twordleDark" : "twordleLight"}>
  <span id="return"><a aria-label="Return to home" href="/"><SVGIcon icon="logo" /></a></span>
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
  <Overlay />
  <div id="twordleBody" class:blurred={$currentGame.menu} on:click={() => twordle.updateGame("menu", 0)} on:keypress={() => twordle.updateGame("menu", 0)}>
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
        <!-- <button class='HowToPlay' on:click={() => (currentGame.howto = !currentGame.howto)}>How to Play</button> -->
      </div>
      <Grid />
      <div id="bottom">
        {#if $storage.keyboard}
          <Keyboard />
        {/if}
        <EventBox on:toast={toastDispatch} on:buttonPress={buttonPress} />
      </div>
    </div>
  </div>
</main>

<style lang="scss">
  @use "../../../css/colours.scss" as *;

  // :global(.twordleDark) {
  //   --main: #232323;
  //   --titleShadow: none;
  //   --text: white;
  // }
  // :global(.twordleLight) {
  //   --main: hsl(36, 58%, 73%);
  //   --titleShadow: 1px 1px 0px white, 2px 2px 0px white;
  //   --text: white;
  // }
  // :global(.twordleShades) {
  //   --mainDarken5: #ddb77f;
  //   --mainDarken10: #d7ab6b;
  //   --mainDarken15: #d2a057;
  //   --mainDarken20: #cc9543;
  //   --mainDarken40: #855e24;
  //   --mainLighten10: #edd9bb;
  //   --mainLighten15: #f2e4cf;
  // }
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
      transition: all 0.2s ease-in-out;
      text-decoration-color: $twordlePurple;
      &:hover {
        text-decoration-color: $white;
      }
      text-shadow: none;
    }
    p {
      margin: 0;
    }
    h1 {
      font-family: "Outfit";
      color: $twordlePurple;
      text-align: center;
      text-shadow: none;
      font-size: 3rem;
      font-weight: bold;
      text-shadow: var(--titleShadow);
      letter-spacing: -1px;
      margin: 0;
      &::selection {
        background-color: $twordlePurple;
        color: $white;
        text-shadow: none;
      }
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

  // .HowToPlay {
  //   padding: 0rem 0rem;
  //   margin: 0.3rem 0rem;
  //   background-color: var(--mainDarken10);
  //   cursor: pointer;
  // }

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
    background-color: var(--inputBackdrop);
    border-radius: 1rem;
    padding: 0.5rem;
    margin-left: 1.5rem;
    margin-top: 1.5rem;
    visibility: hidden;
    font-size: smaller;
    box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.1);
    color: $twordlePurple;
  }

  //TOAST
  #toastBox {
    position: absolute;
    height: max-content;
    left: 0;
    top: 0;
    z-index: 10;
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

  .revealed {
    background-color: var(--mainDarken20) !important;
  }
  .blurred {
    filter: blur(5px) brightness(0.8);
  }

  #return {
    width: 30px;
    height: 30px;
    position: absolute;
    top: 0;
    left: 0;
    margin: 10px 0px 0px 10px;
    opacity: 0.8;
    z-index: 11;
    cursor: pointer;
    pointer-events: all;
    &:hover {
      opacity: 1;
    }
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
