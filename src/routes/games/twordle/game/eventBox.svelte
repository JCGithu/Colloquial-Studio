<script lang="ts">
  export let inputValue = "";
  import { createEventDispatcher, getContext } from "svelte";
  import { currentGame, randomWord, updateGame, incrementGame } from "../Twordle";
  import { storage } from "../../../gameParams";

  const toastQueue: toastUpdate = getContext("toast");
  const dispatch = createEventDispatcher();

  let boxFull = false;
  let errorClass = false;
  let disable = false;
  export let auto = false;

  // This is just to prevent doubleclicks;
  function sendButton() {
    if (!disable) dispatch("buttonPress");
    disable = true;
    setTimeout(() => {
      disable = false;
    }, 1500);
  }

  function wordCheck() {
    boxFull = inputValue.length >= 5;
  }

  function flashError() {
    errorClass = true;
    setTimeout(() => {
      errorClass = false;
    }, 2500);
  }
  function userStart(randomise: boolean) {
    // Checking word is valid
    if (!boxFull && !randomise) {
      toastQueue("❌ Word must be 5 characters ❌", "error");
      return;
    }
    updateGame("answer", randomise ? randomWord($storage.twordle.settings.words) : inputValue.toUpperCase());
    // Checking game is connected
    if (!$currentGame.connected) {
      flashError();
      toastQueue("❌ You need to connect to a Twitch chat to play ❌", "error");
      return;
    }
    storage.incrementStat("twordle", "play", 1);
    incrementGame({ round: -1, letter: -1, votes: 0 });
    dispatch("buttonPress");
  }
</script>

<div class="eventbox {$storage.twordle.settings.dark ? 'twordleDark' : 'twordleLight'}">
  {#if $currentGame.state === "START" && !auto}
    <h2>Pick a 5 letter word</h2>
    <input bind:value={inputValue} class:boxFull class:errorClass type="password" placeholder="I'll hide it, I promise!" maxlength="5" on:keyup={wordCheck} />
    <div>
      <button id="enter" on:click={() => userStart(false)}>Start!</button>
      <button id="random" on:click={() => userStart(true)}>Random Word</button>
    </div>
  {/if}

  {#if $currentGame.state === "OPENING"}
    <h2>Round starting in...</h2>
    <p>{$currentGame.timer}</p>
  {/if}
  {#if $currentGame.state === "POLL"}
    <h2>{$currentGame.timer}</h2>
    <p>{$currentGame.votes} votes cast.</p>
  {/if}
  {#if $currentGame.state === "RETRY"}
    <p>{$currentGame.message}</p>
    {#if !auto}
      <button on:click={sendButton} class:disable>Try Again?</button>
    {/if}
  {/if}
  {#if $currentGame.state === "NEXTROUND"}
    <p>{$currentGame.message}</p>
    {#if !auto}
      <button on:click={sendButton} class:disable>Next Round</button>
    {/if}
  {/if}
  {#if $currentGame.state === "REVEAL"}
    <h2>{$currentGame.currentGuess}</h2>
    {#if !auto}
      <button on:click={sendButton} class:disable>Check Word</button>
    {/if}
  {/if}
  {#if $currentGame.state === "NEXTLINE"}
    <h2>Nope!</h2>
    {#if !auto}
      <button on:click={sendButton} class:disable>Guess Again</button>
    {/if}
  {/if}
  {#if $currentGame.state === "SUCCESS"}
    <h2>Congrats!</h2>
    <p><i>{$currentGame.firstWin}</i> guessed it first!</p>
    {#if !auto}
      <button on:click={() => location.reload()} class:disable>Play Again?</button>
    {/if}
  {/if}
  {#if $currentGame.state === "FAIL"}
    <h2>{$currentGame.answer}</h2>
    <p>You failed to guess the word...</p>
    {#if !auto}
      <button on:click={() => location.reload()} class:disable>Play Again?</button>
    {/if}
  {/if}
</div>

<style lang="scss">
  @use "../../../../css/colours.scss" as *;
  @use "../../../../css/default.scss" as d;
  .eventbox {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    background-color: var(--mainDarken20);
    width: max-content;
    width: 110%;
    height: max-content;
    max-height: 15vh;
    z-index: 4;
    text-align: center;
    border-radius: 1rem;
    margin-top: 0.5em;
    font-size: clamp(1px, 100%, 16px);
    padding: 0.2em 0.5em;
    transition: 0.5s all;
    ::selection {
      background-color: var(--purple);
    }
    @media only screen and (max-width: d.$phone) {
      margin-top: 0;
      font-size: 12px;
      padding-bottom: 12px;
    }
  }
  .boxFull {
    background-color: $twordleGreen;
    color: white;
  }
  .errorClass {
    background-color: $colloquial;
    color: white;
    animation: shake 0.25s ease-in-out;
  }
  @keyframes shake {
    0% {
      transform: translateX(0px) rotate(0deg);
    }
    10% {
      transform: translateX(-5px) rotate(-0.5deg);
    }
    30% {
      transform: translateX(5px) rotate(0.5deg);
    }
    60% {
      transform: translateX(-10px) rotate(-1deg);
    }
    80% {
      transform: translateX(10px) rotate(1deg);
    }
    100% {
      transform: translateX(0px) rotate(0deg);
    }
  }
  h2 {
    color: white;
    font-size: 1.3em;
    padding: 0;
    margin: 0.1rem;
    font-weight: 500;
  }
  p {
    margin: 0.2rem;
    i {
      color: $twordlePurple;
    }
  }
  input {
    font-family: "Poppins";
    appearance: none;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    width: 80%;
    background-color: var(--inputBackdrop);
    color: $twordlePurple;
    &::selection {
      background-color: $twordlePurple !important;
      padding: 1rem;
      border-radius: 1rem !important;
      overflow: hidden !important;
    }
    transition: 0.5s all;
    font-weight: 600;
    font-size: 1rem;
    outline: none;
    text-align: center;
    &::placeholder {
      color: var(--mainDarken10);
    }
    &:focus {
      border-width: 0;
    }
  }
  button {
    appearance: none;
    border: none;
    color: white;
    font-family: "Poppins";
    font-size: large;
    background-color: var(--buttons);
    border-radius: 1rem;
    padding: 0.5rem 1rem;
    margin: 0.5rem;
    transition: 0.2s all;
    width: max-content;
    cursor: pointer;
    &:hover {
      transform: scale(1.02);
      box-shadow: 0px 0px 10px inset rgba(255, 255, 255, 0.2);
    }
    @media only screen and (max-width: d.$phone) {
      margin: 0.2rem;
      font-size: 12px;
    }
  }
  .disable {
    cursor: default;
    opacity: 0.6;
  }
</style>
