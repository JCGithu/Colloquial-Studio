<script lang="ts">
  import { storage } from "../../toolParams";
  import "../../../js/tmi";
  import type { Client, ChatUserstate, SubUserstate } from "tmi.js";
  import { onMount, getContext, onDestroy } from "svelte";
  import { beforeNavigate } from "$app/navigation";

  let toastUpdate: toastUpdate = getContext("toast");

  import { Application } from "svelte-pixi";
  import EmotePhysics from "./EmotePhysics.svelte";
  export let runApp = false;

  let appHeight: number, appWidth: number;

  import type { World } from "@dimforge/rapier2d";
  import { newWorld } from "./physics";
  let rapier2d: RAPIER;
  let rapierPromise = loadRapier();
  let world: World;

  async function loadRapier() {
    await import("@dimforge/rapier2d").then(async (rap) => {
      world = newWorld(rap, appWidth, appHeight);
      rapier2d = rap;
      console.log("RAPIER Loaded");
      return;
    });
  }

  let client: Client;

  onMount(async () => {
    console.log("EmoteDrop has Loaded", $storage.emotedrop.inProgress);

    // @ts-ignore
    client = new tmi.Client({
      channels: [$storage.emotedrop.inProgress.channel],
    });

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
      toastUpdate(`Connected to ${$storage.emotedrop.inProgress.channel} ✅`, "pass");
    });
    client.on("disconnected", () => {
      console.log("Disconnected from Twitch");
    });

    if ($storage.emotedrop.inProgress.channel.length) {
      console.log("Attempting Twitch Connection...");
      client.connect().catch((error: string) => {
        console.log(error);
        if (!runApp) toastUpdate(`Error connecting to ${$storage.emotedrop.inProgress.channel}`, "error");
      });
    }
  });

  function disconnectChat() {
    client.disconnect().catch((error: string) => {
      console.log(error);
    });
  }
  beforeNavigate(disconnectChat);
  onDestroy(disconnectChat);
</script>

<svelte:head>
  <style>
    body {
      overflow: hidden;
    }
  </style>
</svelte:head>

<section class:runApp class:testApp={!runApp} id="emoteDrop">
  <div id="appBoundary" bind:clientHeight={appHeight} bind:clientWidth={appWidth}>
    {#await rapierPromise}
      <p>Loading Physics</p>
    {:then rapierPromise}
      <Application height={appHeight} width={appWidth} backgroundAlpha={0}>
        <EmotePhysics height={appHeight} width={appWidth} {client} {rapier2d} {world} />
      </Application>
    {/await}
  </div>
</section>

<style lang="scss">
  .runApp {
    height: 100vh !important;
  }
  section {
    min-width: 100%;
    min-height: calc(100% - 0.5rem);
    max-height: calc(100% - 0.5rem);
    border-radius: 1rem;
    overflow: hidden;
  }
  #appBoundary {
    position: relative;
    --flex: column;
    --align: flex-start;
    width: 100%;
    --height: 100%;
    height: var(--height);
    min-height: var(--height);
  }
  #emoteDrop {
    width: 100%;
    height: 100%;
  }
  .testApp {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 1rem;
  }
</style>
