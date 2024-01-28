<script lang="ts">
  import { storage } from "../../toolParams";
  import "../../../js/tmi";
  import type { Client, ChatUserstate, SubUserstate } from "tmi.js";
  import { onMount, getContext } from "svelte";
  import { beforeNavigate } from "$app/navigation";

  let toastUpdate: toastUpdate = getContext("toast");

  let appBody: HTMLElement;
  import { Application } from "svelte-pixi";
  import EmotePhysics from "./EmotePhysics.svelte";
  export let runApp = false;
  let reload = 0;

  let appHeight: number, appWidth;
  $: {
    if (appHeight) reload++;
  }

  let backupClient: Client;

  onMount(async () => {
    console.log("EmoteDrop has Loaded", $storage.emotedrop.inProgress);

    // @ts-ignore
    const client: Client = new tmi.Client({
      channels: [$storage.emotedrop.inProgress.channel],
    });
    backupClient = client;

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
      toastUpdate(`Connected to ${$storage.emotedrop.inProgress.channel} ✅`, "pass");
    });

    if ($storage.emotedrop.inProgress.channel.length) {
      console.log("Attempting Twitch Connection...");
      client.connect();
    }
  });

  function disconnectChat() {
    backupClient
      .disconnect()
      .then(() => {
        console.log("Disconnecting from Chat");
      })
      .catch((error: string) => {
        console.log(error);
      });
  }
  beforeNavigate(disconnectChat);
</script>

<svelte:head>
  <style>
    body {
      overflow: hidden;
    }
  </style>
</svelte:head>

<!-- <canvas class:runApp class:testApp={!runApp} id="emoteDrop" bind:this={appBody} /> -->
<section class:runApp class:testApp={!runApp} id="emoteDrop" bind:this={appBody}>
  <div id="appBoundary" bind:clientHeight={appHeight} bind:clientWidth={appWidth}>
    <!-- <ParticleContainer bind:instance={container} autoResize properties={{ scale: true, position: true, rotation: true }} /> -->
    {#key reload}
      <Application height={appHeight} width={appWidth} backgroundAlpha={1}>
        <EmotePhysics height={appHeight} width={appWidth} chatClient={backupClient}></EmotePhysics>
      </Application>
    {/key}
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
    //display: flex;
    width: 100%;
    --height: 100%;
    height: var(--height);
    min-height: var(--height);
    //flex-direction: var(--flex);
    //align-items: var(--align);
    //justify-content: end;
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
