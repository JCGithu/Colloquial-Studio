<script lang="ts">
  import "../../../css/default.scss";
  import { storage, currentGame, changeSetting, incrementStat, decrementStat, undoMove } from "./twFunctions";
  import { Switch } from "@rgossiaux/svelte-headlessui";
  import SvgIcon from "../../SVGIcon.svelte";
  import { slide } from "svelte/transition";

  let channelText: string;
  let rotate: HTMLElement;
  let revealed = false;

  function resetChannel() {
    rotate.animate([{ transform: "rotate(0)" }, { transform: "rotate(360deg)" }], { duration: 500, iterations: 1, easing: "ease-out" });
    changeSetting("channel", channelText);
    location.reload();
  }

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

<div class="innerMenu {$storage.dark ? 'twordleDark' : 'twordleLight'}">
  <p>Channel</p>
  <div id="channel">
    <span bind:this={rotate} on:click={resetChannel} on:keypress={resetChannel}><SvgIcon icon="refresh" fill="var(--settingsDetail)" /></span>
    <input
      type="text"
      on:keypress={(e) => {
        if (e.key === "Enter") resetChannel();
      }}
      bind:value={channelText}
      placeholder={$storage.channel || "Insert Channel Here"}
    />
  </div>
  <div class="settingGrid">
    <p id="volText">Volume</p>
    <div class="volumeBox" class:muted={!$storage.volume}>
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
              fill="var(--text)"
            /></svg
          >
        </div>
        <div class="numberButton">
          <svg on:click={() => decrementStat("timer", 1)} on:keypress={() => decrementStat("timer", 1)} width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
            ><path
              d="M21.69 4.887c-.102-1.34-1.133-2.475-2.577-2.578C17.052 2.103 14.165 2 12 2s-5.052.103-7.113.31c-.722 0-1.34.309-1.753.824-.412.515-.722 1.031-.825 1.753C2.103 6.948 2 9.835 2 12s.206 5.052.31 7.113c.102 1.34 1.133 2.475 2.577 2.578C6.948 21.897 9.835 22 12 22s5.052-.206 7.113-.31c1.34-.102 2.475-1.133 2.578-2.577.206-2.061.309-4.948.309-7.113s-.103-5.052-.31-7.113Zm-5.05 6.598-3.403 3.402c-.31.309-.825.515-1.237.515-.412 0-.928-.206-1.237-.515L7.36 11.485a.809.809 0 0 1 0-1.134.809.809 0 0 1 1.134 0l3.402 3.402c.103.103.31.103.412 0l3.402-3.402a.809.809 0 0 1 1.134 0c.104.412.104.824-.206 1.133Z"
              fill="var(--text)"
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
    <button id="revealButton" on:click={() => (revealed = !revealed)}>Reveal Word</button>
    <button on:click={undoMove}>Undo Move</button>
  </div>
  {#if revealed}
    <h3 transition:slide>{$currentGame.answer || "No Word Yet"}</h3>
  {/if}
</div>

<style lang="scss">
  @use "../../../css/colours.scss" as *;

  .settingGrid {
    display: grid;
    grid-template-columns: 1fr;
    grid-row-gap: 2px;
    * {
      text-align: center;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    p {
      margin-top: 0.5rem;
      margin-bottom: 0;
      padding-bottom: 0;
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
  p {
    margin: 0.1rem;
  }
  button {
    border: none;
    background-color: transparent;
    width: max-content;
    padding: 0.5rem 2rem;
    border-radius: 1rem;
    border: 1px solid var(--buttons);
    color: var(--text);
    //text-transform: uppercase;
    transition: all 0.4s ease-in-out;
    cursor: pointer;
    font-family: "Poppins";
    font-weight: 500;
    &:hover {
      transform: scale(1.02);
      //box-shadow: 0px 0px 10px inset rgba(255, 255, 255, 0.2);
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
  .stackH {
    padding: 0.2rem !important;
    width: 100% !important;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0.5rem;
    button {
      margin: 0.4rem;
    }
  }
  .stackH {
    flex-direction: row;
  }
  .volumeBox {
    background-color: $twordlePurple;
    border-radius: 0.5rem;
    width: 100%;
    align-self: center;
    justify-self: center;
    max-width: 200px;
    margin-bottom: 0.6rem;
    //margin-left: 10%;
    p {
      margin: 0;
      margin-right: -1rem;
      font-size: 13pt;
      min-width: max-content;
      width: 100%;
    }
    input {
      cursor: pointer;
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
    @for $i from 1 through 30 {
      $val: append($val, $i * -5px 0px var(--main), comma);
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
    background-color: var(--settingsDetail);
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
    input {
      margin-top: 0;
      margin-bottom: 0;
    }
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

  #channel {
    position: relative;
    width: 100%;
    height: 3rem;
    margin-bottom: 0.6rem;
    margin-top: 0.2rem;
    span {
      position: absolute;
      height: 1.5rem;
      right: 1rem;
      top: calc(1.6rem - 0.75rem);
      cursor: pointer;
    }

    input {
      height: 1.2rem;
      padding: 1rem 3.5rem 1rem 1.5rem;
      border-radius: 1rem;
      border: none;
      font-family: "Poppins";
      background-color: $whiteFade;
      color: $black;
      width: calc(100% - 5rem);
      box-shadow: inset 0px 0px 10px rgba(256, 256, 256, 0);
      transition: all 1s ease-in-out;
      &:focus {
        outline: none;
        color: black;
        background-color: $white;
        //box-shadow: inset 0px 0px 10px rgba(256, 256, 256, 0);
      }
      &:hover {
        background-color: $white;
        box-shadow: inset 0px 0px 10px rgba(256, 256, 256, 0.5);
      }
      &:-internal-autofill-selected,
      &:focus {
        background-color: $white !important;
      }
    }
    input:-webkit-autofill,
    input:-webkit-autofill:hover,
    input:-webkit-autofill:focus,
    input:-webkit-autofill:active {
      transition: background-color 5000s ease-in-out 0s;
      background-color: $whiteFade !important;
    }
  }
</style>
