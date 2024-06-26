<script lang="ts">
  import { currentGame, undoMove } from "../Twordle";
  import { storage } from "../../../gameParams";
  import { slide } from "svelte/transition";
  import Dash from "../../../../components/DashExport";

  let channelText = $storage.twordle.settings.channel;
  let revealed = false;

  function resetChannel() {
    storage.update((store) => {
      store.twordle.settings.channel = channelText;
      return store;
    });
    location.reload();
  }
</script>

<div class="innerMenu {$storage.twordle.settings.dark ? 'twordleDark' : 'twordleLight'}">
  <Dash.Channel id="channel" center={true} on:refresh={resetChannel} placeholder={$storage.twordle.settings.channel} bind:value={channelText} />
  <p>To run the game without input just add <a href="/games/twordle/brb?channel={$storage.twordle.settings.channel}"><code>/brb</code></a> to the URL!</p>
  <Dash.Range id="volume" faded={!$storage.twordle.settings.volume} customClass="twordleVolume" thumb={"var(--mainDarken20)"} center={true} name="Volume" max="10" min="0" bind:value={$storage.twordle.settings.volume} />
  <Dash.Number id="roundTimer" center={true} name="Round Timer" subtitle="In Seconds" bind:value={$storage.twordle.settings.timer} />
  <Dash.Select bind:value={$storage.twordle.settings.mode} name="Mode" id="ModeSelect" options={{ Letters: "letters", Words: "words" }} />
  <Dash.Select id="wordSelect" bind:value={$storage.twordle.settings.words} name="Word List" options={{ All: "all", "Food/Drink": "food", Gaming: "gaming", Movies: "movies" }} />
  <Dash.Switch name="Dark Mode" id="darkMode" center={true} bind:value={$storage.twordle.settings.dark} />
  <Dash.Switch name="Keyboard" id="Keyboard" center={true} bind:value={$storage.twordle.settings.keyboard} />
  {#if revealed}
    <h3 transition:slide>{$currentGame.answer || "No Word Yet"}</h3>
  {/if}
  <div class="stackH">
    <Dash.Button customClass="TwordleDashButton" background={false} on:click={() => (revealed = !revealed)} text="Reveal Word" />
    <Dash.Button customClass="TwordleDashButton" background={false} on:click={undoMove} text="Undo Move" />
  </div>
</div>

<style lang="scss">
  @use "../../../../css/colours.scss" as *;

  .innerMenu {
    display: flex;
    align-items: center;
    flex-direction: column;
    color: white;
  }
  .stackH {
    padding: 0.2rem !important;
    width: 100% !important;
    max-width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 0.5rem;
    flex-direction: row;
  }
  h3 {
    background-color: $twordlePurple;
    padding: 0.2rem 0.5rem;
    border-radius: 0.3rem;
    text-decoration: underline;
    text-decoration-thickness: 2px;
    text-underline-offset: 4px;
    margin: 0.4rem;
  }
  p {
    text-align: center;
  }
  code {
    background-color: $twordleDark;
    padding: 3px;
    border-radius: 0.4rem;
    overflow: hidden;
    width: fit-content;
    display: inline-block;
    transform: translateY(5px);
  }
  a {
    color: inherit;
  }
</style>
