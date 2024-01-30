<script lang="ts">
  import { fade } from "svelte/transition";
  import { getContext, createEventDispatcher } from "svelte";
  import { get } from "svelte/store";
  import SVGIcon from "../../components/SVGIcon.svelte";
  import Button from "../../components/DashButton.svelte";
  import { loadSave, urlBuild, save, storage } from "../toolParams";
  export let saves: boolean[];

  let appDetails: appDetails = getContext("appDetails");
  const toastUpdate: toastUpdate = getContext("toast");

  const dispatch = createEventDispatcher();

  $: {
    for (let i = 0; i < saves.length; i++) {
      saves[i] = $storage[appDetails.name][i].intro;
    }
  }

  function saveData(num: number) {
    //saveMenu = !saveMenu;
    dispatch("savemenu");
    save(appDetails.name, num);
    toastUpdate("Saved to File " + (num + 1), "pass");
  }
  async function loadData(num: number) {
    await loadSave(appDetails.name, num);
    //saveMenu = !saveMenu;
    dispatch("savemenu");
    urlBuild(appDetails.name);
    toastUpdate("Loaded from Save " + (num + 1), "pass");
  }
  function checkSave(saveExists: boolean, num: number) {
    if (!saveExists) {
      saveData(num);
      return;
    }
    let check = window.confirm("Overwrite Existing Save?");
    if (!check) return;
    saveData(num);
  }
</script>

<div id="saveMenu" class="infoScreen" transition:fade>
  <div class="saveCollection">
    <h2>Saves</h2>
    <div>
      {#each saves as save, i}
        <span class:blank={!save}>
          <p>{!save ? "Empty" : `Save ${i + 1}:`}</p>
          <div>
            <button type="button" on:click={() => checkSave(saves[i], i)}> <SVGIcon icon="save" /></button>
            <button type="button" on:click={() => loadData(i)}> <SVGIcon icon="play" /></button>
          </div>
        </span>
      {/each}
    </div>
    <button class="close" type="button" on:click={() => dispatch("savemenu")} on:submit={() => dispatch("savemenu")}> Close</button>
  </div>
</div>

<style lang="scss">
  @use "../../css/default.scss" as d;
  @use "../../css/colours.scss" as *;

  .infoScreen {
    width: 100vw;
    height: 100vh;
    display: flex;
    position: absolute;
    z-index: 20;
    margin: 0;
    padding: 0;
    top: 0;
    left: 0;
    align-items: center;
    justify-content: center;
    background-color: fade-out(darken($black, 5), 0.3);
  }

  #saveMenu {
    display: flex;
    flex-direction: column;
  }

  p {
    padding: 0;
    margin: 0.5rem;
  }

  h2 {
    padding: 0;
    margin: 0;
    margin-top: -0.5rem;
    color: white;
    line-height: 2;
  }

  .saveCollection {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    border-radius: 1rem;
    border: fade-out($whiteFade, 0.6) solid;
    border-width: 3px 3px 5px 3px;
    background-color: $black;
    div {
      display: flex;
    }
    span {
      display: flex;
      align-items: center;
      flex-direction: column;
      color: white;
      margin: 0.3rem;
      padding: 0.2rem 2rem;
      border-radius: 1rem;
      border-width: 1px;
      border-color: $white;
      border-style: solid;
    }
    button {
      //font-weight: bold;
      font-size: large;
      padding: 0.5rem;
      margin: 0 0.2rem 0 0.2rem;
      border-radius: 0.5rem;
      color: white;
      border: none;
      cursor: pointer;
      height: 2rem;
      background-color: transparent;
      //background-color: red;
      box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0);
      transition: all 250ms cubic-bezier(0.25, 0.25, 0.5, 1.9);
      transform: translateY(-0.1rem);
      &:hover {
        transform: translateY(-0.2rem);
        //box-shadow: 0px 3px 0px 0px rgba(255, 255, 255, 1);
      }
      &:active {
        transform: translateY(0rem);
        //box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0);
      }
    }
  }

  .close {
    margin-top: 0.3rem !important;
    font-family: "Poppins";
    //background-color: red !important;
    opacity: 0.5;
  }

  .blank {
    opacity: 0.3;
    transition: 1s all;
    &:hover {
      opacity: 0.7;
    }
  }
</style>
