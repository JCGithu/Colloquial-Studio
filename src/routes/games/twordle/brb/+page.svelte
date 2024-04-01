<script lang="ts">
  //Functions
  import { onMount, getContext, onDestroy } from "svelte";
  import { beforeNavigate } from "$app/navigation";
  import { get } from "svelte/store";
  import * as twordle from "../Twordle";
  import { currentGame } from "../Twordle";
  import { gameInit, storage } from "../../../gameParams";
  import "../../../../js/tmi";
  import type { Client } from "tmi.js";
  //Components
  import SVGIcon from "../../../../components/SVGIcon.svelte";
  import Grid from "../game/twordleBody.svelte";
  //AUDIO
  let winSound: HTMLAudioElement;
  let roundStart: HTMLAudioElement;
  import roundStartSrc from "../round.mp3";
  import winSoundSrc from "../win.mp3";
  import JSConfetti from "js-confetti";
  import { settings } from "pixi.js";
  //Overlays
  let confetti: JSConfetti;
  let canvas: HTMLCanvasElement;

  //Create Poll
  let poll: Map<string, number> = new Map();
  let usersVoted: Array<string> = [];

  const toastUpdate: toastUpdate = getContext("toast");

  function finishPoll() {
    let finalPoll = Object.fromEntries(poll);
    let finalResult = twordle.getMax(finalPoll);
    storage.incrementStat("twordle", "votes", usersVoted.length);
    poll = new Map();
    // REDO
    if (!finishPoll.length) {
      twordle.changeState("RETRY");
      twordle.updateGame("message", "No one entered!");
    } else if (!finalPoll.length || finalPoll[finalResult[0]] === 0 || finalResult.length > 1) {
      twordle.changeState("RETRY");
      twordle.updateGame("message", `${finalResult.join(", ")} with ${finalPoll[finalResult[0]]} votes.`);
    }
    //CONTINUE
    if (finalResult.length === 1) {
      twordle.changeState("NEXTROUND");
      twordle.updateGame("message", `${finalResult[0]} won with ${finalPoll[finalResult[0]]} votes.`);
      if ($storage.twordle.settings.mode === "letters") {
        twordle.gridLetterUpdate(finalResult[0]);
        twordle.updateGuess();
        if ($currentGame.letter === 4) {
          twordle.changeState("REVEAL");
        } else {
          twordle.incrementGame({ letter: 1, round: 0, votes: 0 });
        }
      } else {
        twordle.gridWordUpdate(finalResult[0]);
        twordle.updateGuess();
        twordle.changeState("REVEAL");
      }
    }
    autoPress();
  }

  function startPoll() {
    if ($currentGame.state === "POLL") return;
    twordle.changeState("POLL");
    twordle.updateGame("timer", $storage.twordle.settings.timer);
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

  function newRound() {
    console.log("Starting new round");
    usersVoted = [];
    twordle.updateGame("timer", 3);
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

  let autoOn = false;
  function autoPress() {
    if (autoOn) return;
    autoOn = true;
    setTimeout(() => {
      autoOn = false;
      buttonPress();
    }, 3000);
  }

  function delayReload() {
    setTimeout(() => {
      location.reload();
    }, 15000);
  }

  function buttonPress() {
    if ($currentGame.state === "REVEAL") {
      if ($currentGame.currentGuess === $currentGame.answer) {
        // Success
        storage.incrementStat("twordle", "won", 1);
        twordle.incrementGame({ round: 1, letter: 1, votes: 0 });
        twordle.changeState("SUCCESS");
        confetti.addConfetti();
        winSound.play();
        delayReload();
      } else if ($currentGame.round != 5) {
        twordle.incrementGame({ round: 1, letter: -1, votes: 0 });
        twordle.changeState("NEXTLINE");
        autoPress();
      } else {
        // Fail
        twordle.incrementGame({ round: 1, letter: 0, votes: 0 });
        twordle.changeState("FAIL");
        delayReload();
      }
    } else {
      newRound();
    }
  }

  let client: Client;
  onMount(async () => {
    let URLdata = new URLSearchParams(window.location.search);
    let channel = URLdata.get("channel") || "";
    if (channel.length) $storage.twordle.settings.channel = channel;

    //LANGUAGES
    let languageCode = navigator.language.substring(0, 2);
    if (Object.keys(twordle.languageList).includes(languageCode)) {
      storage.update((settings) => ({ ...settings, ["language"]: languageCode }));
    }

    confetti = new JSConfetti({ canvas });

    //@ts-ignore
    client = new tmi.Client({
      channels: [$storage.twordle.settings.channel],
    });

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
      twordle.updateGame("connected", true);
      toastUpdate(`Connected to ${$storage.twordle.settings.channel} chat`, "pass");
      // Starting game BRB
      twordle.updateGame("answer", twordle.randomWord($storage.twordle.settings.words));
      storage.incrementStat("twordle", "play", 1);
      twordle.incrementGame({ round: -1, letter: -1, votes: 0 });
      buttonPress();
    });

    client.on("chat", (channel, tags, message, self) => {
      if (self || !channel || message.length > 5) return;
      if (typeof tags.username === "string") if (usersVoted.includes(tags.username)) return;
      let gameSetting = get(storage).twordle.settings;
      message = message.replace("ß", "ẞ").toUpperCase();
      if ((gameSetting.mode === "letters" && message.length != 1) || (gameSetting.mode === "words" && message.length != 5)) return;
      if (!twordle.characterChecker(message)) return;
      poll.set(message, (poll.get(message) ?? 0) + 1);
      twordle.incrementGame({ votes: 1, letter: 0, round: 0 });
      usersVoted.push(tags.username || "");
      console.log(`${tags.username} has voted!`);
    });

    if ($storage.twordle.settings.channel || $storage.twordle.settings.channel != "") {
      client.connect();
    }
  });

  function disconnectChat() {
    if (!client) return;
    client.disconnect().catch((error: string) => {
      console.log(error);
    });
  }
  beforeNavigate(disconnectChat);
  onDestroy(disconnectChat);
</script>

<svelte:head>
  <title>Twordle</title>
  <style>
    body {
      overflow: hidden;
    }
  </style>
</svelte:head>

<main class={$storage.twordle.settings.dark ? "twordleDark" : "twordleLight"}>
  {#await gameInit(toastUpdate)}
    <p>Loading</p>
  {:then run}
    <span id="return"><a aria-label="Return to home" href="/"><SVGIcon icon="logo" /></a></span>
    <audio bind:this={winSound} src={winSoundSrc} volume={$storage.twordle.settings.volume / 10} />
    <audio bind:this={roundStart} src={roundStartSrc} volume={$storage.twordle.settings.volume / 10} />
    <canvas id="confetti" bind:this={canvas} />
    <div id="twordleBody">
      <div id="twordle">
        <h1 class="Title">Twordle</h1>
        <Grid auto={true} on:buttonPress={buttonPress} />
      </div>
    </div>
  {/await}
</main>

<style lang="scss">
  @use "../../../../css/colours.scss" as *;
  @use "../../../../css/default.scss" as d;

  main {
    font-family: "Poppins";
    background-color: var(--main);
    height: 100vh;
  }
  canvas {
    width: 100vw;
    height: 100vh;
    position: absolute;
  }
  #twordleBody {
    display: flex;
    justify-content: center;
    height: 100vh;
    width: 100vw;
    margin: 0;
    padding: 0;
    padding-top: 5vh;
    overflow: hidden;
    background-color: var(--main);
    transition: all 500ms ease-in-out;
    @media only screen and (max-width: d.$phone) {
      padding-top: 1vh;
      height: 98vh;
    }
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
    //justify-content: center;
    color: white;
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
    font-family: "Outfit";
    color: $twordlePurple;
    text-align: center;
    font-size: 3rem;
    font-weight: bold;
    text-shadow: var(--titleShadow);
    letter-spacing: -1px;
    margin: 0 0 0.6rem 0;
    text-shadow:
      1px 1px $white,
      2px 2px $white,
      3px 3px $white;
    &::selection {
      background-color: $twordlePurple;
      color: $white;
      text-shadow: none;
    }
  }

  .twordleDark {
    h1 {
      text-shadow: none;
    }
  }

  #return {
    width: 30px;
    height: 30px;
    position: absolute;
    top: 0;
    left: 0;
    margin: 10px 0px 0px 10px;
    opacity: 0.8;
    z-index: 9;
    cursor: pointer;
    pointer-events: all;
    &:hover {
      opacity: 1;
    }
  }
</style>
