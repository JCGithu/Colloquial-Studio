<script lang="ts">
  import { storage } from "../../toolParams";
  import { Engine, Render, Runner, Composite, World, Body, Bodies, Sleeping } from "matter-js";
  import "../../../js/tmi";
  import type { Client } from "tmi.js";
  import twemoji from "twemoji";
  import { onMount, getContext } from "svelte";
  import { beforeNavigate } from "$app/navigation";
  let toastUpdate: toastUpdate = getContext("toast");
  export let runApp = false;

  let appBody: HTMLElement, appSize: DOMRect;
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

  const emojiReg = /<img.*?src=["'](.*?)["']/;
  function extractEmojisFromString(inputString: string) {
    let emojiContainer = twemoji.parse(inputString);
    console.log(emojiContainer);
    let emojiMatch = emojiContainer.match(emojiReg);
    if (emojiMatch) {
      return emojiMatch[1];
    } else {
      return false;
    }
  }

  function createWorld() {
    // Create engine
    let engine = Engine.create({
      enableSleeping: $storage.emotedrop.inProgress.sleep,
    });
    let world = engine.world;

    console.log(appSize);

    // Create renderer
    let render = Render.create({
      element: appBody,
      engine: engine,
      options: {
        width: appSize.width,
        height: appSize.height + 20,
        wireframes: false,
        background: "transparent",
        wireframeBackground: "transparent",
        showSleeping: false,
      },
    });
    Render.run(render);
    Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: appSize.width, y: appSize.height },
    });

    let FPS = 60;
    setInterval(function () {
      Engine.update(engine, 950 / FPS);
    }, 1000 / FPS);

    let halfHeight = appSize.height * 0.5;
    let halfWidth = appSize.width * 0.5;
    let showBoundaries = false;

    Composite.add(world, [Bodies.rectangle(halfWidth, appSize.height + 10, appSize.width, 40, { isStatic: true, render: { fillStyle: "#14151f", visible: showBoundaries } }), Bodies.rectangle(0, halfHeight, 1, appSize.height, { isStatic: true, render: { visible: showBoundaries } }), Bodies.rectangle(appSize.width, halfHeight, 1, appSize.height, { isStatic: true, render: { visible: showBoundaries } })]);
    return world;
  }

  function wipe(num: number, targetWorld: World) {
    let bodyList = Composite.allBodies(targetWorld);
    if (num) {
      for (let numDel = 1; numDel <= num; numDel++) {
        Composite.remove(targetWorld, bodyList[numDel + 3]);
      }
      return;
    }
    bodyList.forEach((body) => {
      if (body.label === "Circle Body") {
        Composite.remove(targetWorld, body);
      }
    });
  }

  let backupClient: Client;

  onMount(async () => {
    console.log("EmoteDrop has Loaded", $storage.emotedrop.inProgress);

    appSize = appBody.getBoundingClientRect();
    let renderedWorld = createWorld();

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
      // Just to avoid a TS error
      console.log(channel);

      // Deleting emotes
      if (message.startsWith("!emotewipe")) {
        let allowed = tags.badges?.broadcaster ? true : false;
        if ($storage.emotedrop.inProgress.modWipe && tags.badges?.moderator) allowed = true;
        if (!allowed) return;
        if (message === "!emotewipe") {
          wipe(0, renderedWorld);
        } else {
          let num = parseInt(message.split(" ")[1]);
          wipe(num, renderedWorld);
        }
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
      let batch: Array<Bodies> = [];
      for (let i in tags.emotes) {
        for (let k in tags.emotes[i]) {
          let newCircle = Bodies.circle(getRandomInt(positionDrop), -25, radius, {
            restitution: bounce,
            render: {
              sprite: {
                texture: `http://static-cdn.jtvnw.net/emoticons/v2/${i}/default/light/${img}`,
                xScale: Scale,
                yScale: Scale,
              },
            },
          });
          Composite.add(renderedWorld, [newCircle]);
          batch.push(newCircle);
        }
      }

      const emojis = extractEmojisFromString(message);
      if (emojis) {
        console.log(emojis);
        let newCircle = Bodies.circle(getRandomInt(positionDrop), -25, radius, {
          restitution: bounce,
          render: {
            sprite: {
              texture: emojis,
              xScale: Scale,
              yScale: Scale,
            },
          },
        });
        Composite.add(renderedWorld, [newCircle]);
      }

      let bodyList = Composite.allBodies(renderedWorld);
      if (bodyList.length > limit + 3) {
        for (let obj in bodyList) {
          if (bodyList.length > limit + 3) {
            Composite.remove(renderedWorld, bodyList[3]);
          } else {
            break;
          }
        }
      }

      setTimeout(function () {
        Composite.remove(renderedWorld, batch);
        Composite.allBodies(renderedWorld).forEach((bod) => {
          Sleeping.set(bod, false);
        });
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

<section class:runApp class:testApp={!runApp} id="emoteDrop" bind:this={appBody} />

<style lang="scss">
  .runApp {
    height: 100vh;
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
