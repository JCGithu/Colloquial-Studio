<script lang="ts">
  import "../../../css/default.scss";
  import { getContext, createEventDispatcher } from "svelte";
  import { storage, changeSetting, incrementStat, decrementStat } from "./twFunctions";
  import { Switch } from "@rgossiaux/svelte-headlessui";
  const dispatch = createEventDispatcher();

  let styleString: string = getContext("colours");

  let channelText: string;
  function resetChannel() {
    changeSetting("channel", channelText);
    location.reload();
  }
  function revealWord() {
    //FINISH
  }
  function undoMove() {}

  function darkToggle({ detail }: { detail: boolean }) {
    changeSetting("dark", detail);
  }
  function autoToggle({ detail }: { detail: boolean }) {
    changeSetting("auto", detail);
  }
  function keyboardToggle({ detail }: { detail: boolean }) {
    changeSetting("keyboard", detail);
  }
  function timerChange(e: any) {
    console.log(e);
    //changeSetting("timer", detail);
  }
</script>

<div class="innerMenu" style={styleString}>
  <h1>Settings</h1>
  <div class="stackV">
    <input class="zoomInput" placeholder={$storage.channel || "Insert Channel Here"} bind:value={channelText} id="channel" />
    <button on:click={resetChannel}>Reconnect</button>
  </div>
  <div class="settingGrid">
    <p id="volText">Volume</p>
    <div class="volumeBox">
      <p>{$storage.volume ? "🔊" : "🔇"}</p>
      <input id="volume" class:muted={!$storage.volume} bind:value={$storage.volume} type="range" max="10" min="0" />
    </div>
    <p>Round Timer</p>
    <div>
      <span id="numberWrap">
        <input type="number" id="Round Timer" bind:value={$storage.timer} on:change={timerChange} />
        <div class="numberButton">
          <svg on:click={() => incrementStat("timer", 1)} on:keypress={() => incrementStat("timer", 1)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            ><path
              d="M21.69 4.887c-.102-1.34-1.133-2.475-2.577-2.578C17.052 2.103 14.165 2 12 2s-5.052.103-7.113.31c-.722 0-1.34.309-1.753.824-.412.515-.722 1.031-.825 1.753C2.103 6.948 2 9.835 2 12s.206 5.052.31 7.113c.102 1.34 1.133 2.475 2.577 2.578C6.948 21.897 9.835 22 12 22s5.052-.206 7.113-.31c1.34-.102 2.475-1.133 2.578-2.577.206-2.061.309-4.948.309-7.113s-.103-5.052-.31-7.113Zm-5.05 8.66c-.207.102-.31.206-.516.206a.788.788 0 0 1-.516-.207l-3.402-3.402a.314.314 0 0 0-.412 0l-3.402 3.402a.809.809 0 0 1-1.134 0 .809.809 0 0 1 0-1.134L10.66 9.01a1.805 1.805 0 0 1 2.577 0l3.402 3.402c.31.413.31.825 0 1.134Z"
              fill="#232323"
            /></svg
          >
        </div>
        <div class="numberButton">
          <svg on:click={() => decrementStat("timer", 1)} on:keypress={() => decrementStat("timer", 1)} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            ><path
              d="M21.69 4.887c-.102-1.34-1.133-2.475-2.577-2.578C17.052 2.103 14.165 2 12 2s-5.052.103-7.113.31c-.722 0-1.34.309-1.753.824-.412.515-.722 1.031-.825 1.753C2.103 6.948 2 9.835 2 12s.206 5.052.31 7.113c.102 1.34 1.133 2.475 2.577 2.578C6.948 21.897 9.835 22 12 22s5.052-.206 7.113-.31c1.34-.102 2.475-1.133 2.578-2.577.206-2.061.309-4.948.309-7.113s-.103-5.052-.31-7.113Zm-5.05 6.598-3.403 3.402c-.31.309-.825.515-1.237.515-.412 0-.928-.206-1.237-.515L7.36 11.485a.809.809 0 0 1 0-1.134.809.809 0 0 1 1.134 0l3.402 3.402c.103.103.31.103.412 0l3.402-3.402a.809.809 0 0 1 1.134 0c.104.412.104.824-.206 1.133Z"
              fill="#232323"
            /></svg
          >
        </div>
      </span>
    </div>
    <p>Dark Mode</p>
    <span>
      <Switch checked={$storage.dark} on:change={darkToggle} class={$storage.dark ? "switch switch-enabled" : "switch switch-disabled"}>
        <span class="sr-only">Enable notifications</span>
        <span class="toggle" class:toggle-on={$storage.dark} class:toggle-off={!$storage.dark} />
      </Switch>
    </span>
    <p>Auto Mode</p>
    <span>
      <Switch checked={$storage.auto} on:change={autoToggle} class={$storage.auto ? "switch switch-enabled" : "switch switch-disabled"}>
        <span class="sr-only">Enable notifications</span>
        <span class="toggle" class:toggle-on={$storage.auto} class:toggle-off={!$storage.auto} />
      </Switch>
    </span>
    <p>Keyboard</p>
    <span>
      <Switch checked={$storage.keyboard} on:change={keyboardToggle} class={$storage.keyboard ? "switch switch-enabled" : "switch switch-disabled"}>
        <span class="sr-only">Enable notifications</span>
        <span class="toggle" class:toggle-on={$storage.keyboard} class:toggle-off={!$storage.keyboard} />
      </Switch>
    </span>
  </div>
  <div class="stackH">
    <button id="revealButton" on:click={revealWord}>Reveal Word</button>
    <button on:click={undoMove}>Undo Move</button>
  </div>

  <button
    on:click={() => {
      dispatch("close");
    }}>Close</button
  >
</div>

<style lang="scss">
  @import "../../../css/colours.scss";
  .innerMenu {
    font-family: "Poppins";
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
    background-color: var(--main);
    border-radius: 1rem;
    padding: 1rem;
    margin-top: 5rem;
    transition: 1s all ease-in-out;
    color: var(--text);
    z-index: 2;
    max-height: 90vh;
    @media only screen and (max-width: "800px") {
      width: 100%;
    }
  }

  :global(.zoomInput) {
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
      z-index: 10;
    }
  }

  .settingGrid {
    display: grid;
    grid-template-columns: 100px 200px;
    grid-row-gap: 2px;
    * {
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
    }
    input {
      appearance: none;
      border: none;
      border-radius: 0.5rem;
      padding: 0.5rem;
      margin: 0.5rem;
      width: max-content;
      font-family: "Poppins";
      font-weight: bold;
    }
    input[type="number"] {
      max-width: 20%;
      text-align: center;
    }
  }
  h1 {
    color: var(--text);
    font-weight: bold;
    font-size: 1.5rem;
    padding: 0;
    margin: 0;
    //text-decoration: underline;
    text-decoration-color: var(--purple);
  }
  p {
    margin: 0.1rem;
  }
  .zoomInput {
    margin-top: 0.25rem;
  }
  button {
    border: none;
    background-color: var(--mainDarken10);
    width: max-content;
    padding: 0.5rem 2rem;
    border-radius: 1rem;
    color: var(--text);
    //text-transform: uppercase;
    transition: all 0.4s ease-in-out;
    cursor: pointer;
    font-family: "Poppins";
    font-weight: 500;
    &:hover {
      transform: scale(1.02);
      box-shadow: 0px 0px 10px inset rgba(255, 255, 255, 0.2);
    }
  }
  input {
    appearance: none;
    border: none;
    border-radius: 0.5rem;
    &:focus {
      border: none !important;
      outline: none;
    }
    //padding: 0.5rem;
    //margin: 0.5rem;
    //width: max-content;
  }
  .stackV,
  .stackH {
    padding: 0.2rem !important;
    width: 100% !important;
    display: flex;
    justify-content: center;
    align-items: center;
    button {
      margin: 0.4rem;
    }
  }
  .stackV {
    flex-direction: column;
  }
  .stackH {
    flex-direction: row;
  }
  .volumeBox {
    background-color: $twordlePurple;
    border-radius: 0.5rem;
    width: 100%;
    //margin-left: 10%;
    p {
      margin-right: -1rem;
      font-size: 13pt;
    }
    input {
      clip-path: polygon(0 40%, 100% 0, 100% 100%, 0 60%);
    }
  }
  .muted {
    accent-color: grey;
    opacity: 0.6;
  }

  ::-webkit-slider-runnable-track {
    margin: -0.5rem -0.6rem !important;
  }

  @mixin volume-shadow() {
    $val: ();
    @for $i from 1 through 14 {
      $val: append($val, $i * -10px 0px var(--main), comma);
    }
    box-shadow: $val;
  }

  ::-webkit-slider-thumb {
    height: 23px;
    width: 15px;
    border-radius: 0 1rem 1rem 0;
    @include volume-shadow();
    //box-shadow: -10px 0px var(--main), -20px 0px var(--main), -60px 0px var(--main), -80px 0px var(--main), -100px 0px var(--main), -120px 0px var(--main), -140px 0px var(--main);
    background: var(--main);
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: 0px;
  }

  :global(.switch) {
    position: relative;
    display: inline-flex;
    align-items: center;
    border-radius: 9999px;
    border-width: 0px;
    height: 1.5rem;
    width: 2.75rem;
    cursor: pointer;
    transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :global(.switch-enabled) {
    /* Blue */
    background-color: $twordlePurple;
  }

  :global(.switch-disabled) {
    /* Gray */
    background-color: var(--mainDarken10);
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

  input[type="number"] {
    //width: 100% !important;
    &::-webkit-inner-spin-button {
      appearance: none;
      cursor: pointer;
      pointer-events: none;
      display: block;
      width: 0px;
      color: rgb(248, 248, 248);
      text-align: center;
      position: relative;
    }
  }
  #numberWrap {
    position: relative;
    overflow: hidden;
    div {
      position: absolute;
      transition: 0.3s all ease-in-out;
      border-radius: 3px;
      width: fit-content;
      color: #232323;
      cursor: pointer;
      &:hover {
        opacity: 0.9;
        transform: scale(0.9);
      }
    }
    :nth-child(2) {
      right: 20%;
    }
    :nth-child(3) {
      left: 20%;
    }
  }
</style>
