<script lang="ts">
  import { error } from "@sveltejs/kit";
  export let inputValue = "";
  export let currentGame: TwordleGame;
  import { afterUpdate, createEventDispatcher } from "svelte";
  const dispatch = createEventDispatcher();

  import { incrementStat, randomWord } from "./twFunctions";

  let boxFull = false;
  let errorClass = false;
  let disable = false;

  $: starting = currentGame.state === "START";
  $: opening = currentGame.state === "OPENING";
  $: playing = currentGame.state === "POLL";

  // MAY NEED ONE FOR A RETRY;
  $: retry = currentGame.state === "RETRY";
  $: nextround = currentGame.state === "NEXTROUND";
  $: reveal = currentGame.state === "REVEAL";
  $: nextline = currentGame.state === "NEXTLINE";

  $: success = currentGame.state === "SUCCESS";
  $: fail = currentGame.state === "FAIL";

  function sendButton() {
    if (!disable) dispatch("buttonPress");
    disable = true;
    setTimeout(() => {
      disable = false;
    }, 1500);
  }

  function wordCheck() {
    boxFull = false;
    if (inputValue.length >= 5) boxFull = true;
  }
  function startCheck() {
    if (!currentGame.connected) {
      errorClass = true;
      setTimeout(() => {
        errorClass = false;
      }, 2500);
      dispatch("toast", { message: "❌ You need to connect to a Twitch chat to play ❌", code: "error" });
      return;
    }
    incrementStat("play", 1);
    currentGame.round = 0;
    currentGame.letter = 0;
    dispatch("buttonPress");
  }
  function userStart() {
    if (!boxFull) {
      dispatch("toast", { message: "❌ Word must be 5 characters ❌", code: "error" });
      return;
    }
    currentGame.answer = inputValue.toUpperCase();
    startCheck();
  }
  function randomStart() {
    currentGame.answer = randomWord().toUpperCase();
    startCheck();
  }
</script>

<div class="eventbox">
  {#if starting}
    <h2>Pick a 5 letter word</h2>
    <input bind:value={inputValue} class:boxFull class:errorClass type="password" placeholder="I'll hide it, I promise!" maxlength="5" on:keyup={wordCheck} />
    <div>
      <button id="enter" on:click={userStart}>Start!</button>
      <button id="random" on:click={randomStart}>Random Word</button>
    </div>
  {/if}
  {#if opening}
    <h2>Round starting in...</h2>
    <p>{currentGame.timer}</p>
  {/if}
  {#if playing}
    <h2>{currentGame.timer}</h2>
    <p>{currentGame.votes} votes cast.</p>
  {/if}
  {#if retry}
    <p>{currentGame.message}</p>
    <div>
      <button on:click={sendButton} class:disable>Try Again?</button>
    </div>
  {/if}
  {#if nextround}
    <p>{currentGame.message}</p>
    <button on:click={sendButton} class:disable>Next Round</button>
  {/if}
  {#if reveal}
    <h2>{currentGame.guess[currentGame.round].join("")}</h2>
    <button on:click={sendButton} class:disable>Check Word</button>
  {/if}
  {#if nextline}
    <h2>Nope!</h2>
    <button on:click={sendButton} class:disable>Guess Again</button>
  {/if}
  {#if success}
    <h2>Congrats!</h2>
    <p>You guessed in {currentGame.round} tries!</p>
    <button on:click={() => location.reload()} class:disable>Play Again?</button>
  {/if}
  {#if fail}
    <h2>{currentGame.answer}</h2>
    <p>You failed to guess the word...</p>
    <button on:click={() => location.reload()} class:disable>Play Again?</button>
  {/if}
</div>

<style lang="scss">
  @import "../../../css/colours.scss";
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
    @media only screen and (max-height: "800px") {
      margin-top: 0;
    }
    @media only screen and (max-height: "700px") {
      font-size: clamp(1px, 60%, 16px);
    }
    padding: 0.2em 0.5em;
    transition: 0.5s all;
    ::selection {
      background-color: var(--purple);
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
  }
  input {
    font-family: "Poppins";
    appearance: none;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 1rem;
    width: 80%;
    background-color: var(--mainLighten10);
    color: var(--purple);
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
    color: var(--text);
    font-family: "Poppins";
    font-weight: 600;
    font-size: large;
    background-color: var(--mainDarken10);
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
  }
  .disable {
    cursor: default;
    opacity: 0.6;
  }
</style>
