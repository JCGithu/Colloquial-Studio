<script lang="ts">
  import { storage } from "../../toolParams";
  import "../../../js/tmi";
  import type { Client, ChatUserstate, SubUserstate } from "tmi.js";
  import { onMount, getContext } from "svelte";
  import { beforeNavigate } from "$app/navigation";

  let appBody, appSize: DOMRect;
  import * as PIXI from "pixi.js";
  import { Application, Sprite, onTick } from "svelte-pixi";

  import("@dimforge/rapier2d").then((RAPIER) => {
    // Use the RAPIER module here.
    let gravity = { x: 0.0, y: -9.81 };
    let world = new RAPIER.World(gravity);

    // Create the ground
    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(10.0, 0.1);
    world.createCollider(groundColliderDesc);

    // Create a dynamic rigid-body.
    let rigidBodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(0.0, 1.0);
    let rigidBody = world.createRigidBody(rigidBodyDesc);

    // Create a cuboid collider attached to the dynamic rigidBody.
    let colliderDesc = RAPIER.ColliderDesc.cuboid(0.5, 0.5);
    let collider = world.createCollider(colliderDesc, rigidBody);
    console.log(world);
  });

  onTick((delta) => {
    console.log(delta);
    // world.step();
    // let pos = rigidBody.translation();
    // console.log(pos.x, pos.y);
  });
  let toastUpdate: toastUpdate = getContext("toast");
  export let runApp = false;

  let probabilityChart = [1, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9, 10];
  let ballScaleChart: { [x: number]: { img: string; scale: number; radius: number } } = {
    1: { img: "1.0", scale: 1, radius: 8 },
    2: { img: "1.0", scale: 1.3, radius: 10 },
    3: { img: "2.0", scale: 0.7, radius: 15 },
    4: { img: "2.0", scale: 0.85, radius: 18 },
    5: { img: "2.0", scale: 1, radius: 22 },
    6: { img: "2.0", scale: 1.2, radius: 25 },
    7: { img: "3.0", scale: 0.75, radius: 30 },
    8: { img: "3.0", scale: 0.9, radius: 35 },
    9: { img: "3.0", scale: 1, radius: 40 },
    10: { img: "3.0", scale: 1.2, radius: 45 },
  };
  $: img = ballScaleChart[$storage.emotedrop.inProgress.esize].img || "2.0";
  $: radius = ballScaleChart[$storage.emotedrop.inProgress.esize].radius || 20;
  $: Scale = ballScaleChart[$storage.emotedrop.inProgress.esize].scale || 1;
  $: limit = $storage.emotedrop.inProgress.blimit;
  $: time = $storage.emotedrop.inProgress.etime * 1000;
  $: bounce = $storage.emotedrop.inProgress.bounce / 10;

  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  const fullEmojiRegex = /[\u{1F300}-\u{1F6FF}]/gu;
  function extractEmojisFromString(inputString: string): Array<string> {
    const emojiMatches = inputString.match(fullEmojiRegex);
    let emojiArray: Array<string> = [];
    if (emojiMatches) {
      emojiMatches.forEach((v, i) => {
        let code = emojiMatches[i].codePointAt(0);
        let unicode = code?.toString(16);
        emojiArray.push(`https://twemoji.maxcdn.com/v/14.0.2/72x72/${unicode}.png`);
      });
    }
    return emojiArray;
  }

  let backupClient: Client;

  onMount(async () => {
    console.log("EmoteDrop has Loaded", $storage.emotedrop.inProgress);

    //appSize = appBody.getBoundingClientRect();

    // @ts-ignore
    const client: Client = new tmi.Client({
      channels: [$storage.emotedrop.inProgress.channel],
    });
    backupClient = client;

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
      toastUpdate(`Connected to ${$storage.emotedrop.inProgress.channel} ✅`, "pass");
    });

    client.on("chat", (channel, tags, message) => {
      // Deleting emotes
      if (message.startsWith("!emotewipe")) {
        let allowed = tags.badges?.broadcaster ? true : false;
        if ($storage.emotedrop.inProgress.modWipe && tags.badges?.moderator) allowed = true;
        if (!allowed) return;
        return;
      }
      if (document.hidden) return;

      if ($storage.emotedrop.inProgress.random) {
        let randomNumber = getRandomInt(probabilityChart.length);
        img = ballScaleChart[probabilityChart[randomNumber]].img;
        radius = ballScaleChart[probabilityChart[randomNumber]].radius;
        Scale = ballScaleChart[probabilityChart[randomNumber]].scale;
      }

      let positionDrop = appSize.width * 0.9 + appSize.width * 0.05;
      for (let i in tags.emotes) {
        for (let k in tags.emotes[i]) {
          // FOR EACH EMOTE
        }
      }

      const emojis = extractEmojisFromString(message);
      if (emojis.length) {
        emojis.forEach((e, i) => {
          // FOR EACH EMOJI
        });
      }

      //Delete above limit

      setTimeout(function () {
        // Delete after time
      }, time);
    });

    if ($storage.emotedrop.inProgress.channel.length) {
      console.log("Attempting Twitch Connection...");
      client.connect();
    }
  });
  beforeNavigate(async () => {
    console.log("bye!");
    backupClient.disconnect().catch((error: string) => {
      console.log(error);
    });
  });
</script>

<svelte:head>
  <style>
    body {
      overflow: hidden;
    }
  </style>
</svelte:head>

<!-- <canvas class:runApp class:testApp={!runApp} id="emoteDrop" bind:this={appBody} /> -->
<Application bind:this={appBody} width={100} height={100} render="demand" />

<style lang="scss">
  .runApp {
    height: 100vh !important;
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
