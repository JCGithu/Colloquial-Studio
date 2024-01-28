<script lang="ts">
  import { storage } from "../../toolParams";
  import "../../../js/tmi";
  import type { Client, ChatUserstate, SubUserstate } from "tmi.js";
  import { onMount, getContext, onDestroy } from "svelte";

  import RAPIER from "@dimforge/rapier2d-compat";

  import * as PIXI from "pixi.js";
  import { AnimatedGIF } from "@pixi/gif";
  import { Sprite, onTick, Graphics } from "svelte-pixi";
  import { AnimatedGIFAsset } from "@pixi/gif";
  import { draw } from "svelte/transition";

  export let width = 400;
  export let height = 400;
  const starSize = 2;

  type star = AnimatedGIF | PIXI.Sprite;

  let container: PIXI.Graphics;
  let amount = 100;
  let stars: Array<star> = [];
  let emoteArray: Array<star>;

  async function run_simulation() {
    await RAPIER.init();
    console.log("WOW");
    // Use the RAPIER module here.
    let scaleFactor = 50;
    let gravity = new RAPIER.Vector2(0.0, -9.81 * scaleFactor);
    let world = new RAPIER.World(gravity);

    const emoteSprites = [];

    // Create the ground
    let groundBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, height);
    let groundBody = world.createRigidBody(groundBodyDesc);
    let groundColliderDesc = RAPIER.ColliderDesc.cuboid(width, 1);
    world.createCollider(groundColliderDesc, groundBody);

    //Create left wall
    let leftWallBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(0, 0);
    let leftWallBody = world.createRigidBody(leftWallBodyDesc);
    let leftWallColliderDesc = RAPIER.ColliderDesc.cuboid(1, height);
    world.createCollider(leftWallColliderDesc, leftWallBody);

    //Create right wall
    let rightWallBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(width, 0);
    let rightWallBody = world.createRigidBody(rightWallBodyDesc);
    let rightWallColliderDesc = RAPIER.ColliderDesc.cuboid(1, height);
    world.createCollider(rightWallColliderDesc, rightWallBody);

    async function addEmote(img: string) {
      let x = Math.random() * width;
      let y = 0;
      let bodyDesc = RAPIER.RigidBodyDesc.dynamic().setTranslation(x, y);
      let body = world.createRigidBody(bodyDesc);
      let colliderDesc = RAPIER.ColliderDesc.ball(8);
      world.createCollider(colliderDesc, body);
      let curr = PIXI.Sprite.from(img);
      emoteArray.push(curr);
    }
  }

  async function updateStar(star: star) {
    star.y++;
    if (star.y > height) star.destroy();
  }
  function starWipe() {
    if (!stars.length) return;
    stars.forEach((star) => {
      if (star !== null && star.destroy) {
        star.destroy();
      }
    });
  }

  let gifURL = "https://static-cdn.jtvnw.net/emoticons/v2/emotesv2_8d528caa0c7641528afdecc21963ccab/default/dark/1.0";

  const createInitialStars = async (container: PIXI.ParticleContainer<any>) => {
    if (!container) return;
    starWipe();

    console.log("initial");

    // create stars
    stars = new Array(amount).fill(null).map(() => {
      let star = new PIXI.Sprite(PIXI.Texture.from("/star.png"));
      star.x = Math.random() * width;
      star.y = Math.random() * height;
      star.scale.set(Math.random() * starSize);
      star.anchor.set(0.5, 0.7);
      return star;
    });
    if (stars.length) container.addChild(...stars);
  };

  // setInterval(() => {
  //   console.log("new star!");
  //   fetch(gifURL)
  //     .then((res) => res.arrayBuffer())
  //     .then(AnimatedGIF.fromBuffer)
  //     .then((test) => {
  //       test.x = Math.random() * width;
  //       test.y = Math.random() * height;
  //       test.scale.set(Math.random() * starSize);
  //       test.anchor.set(0.5, 0.7);
  //       stars.push(test);
  //       console.log(stars.length);
  //       if (stars.length) container.addChild(test);
  //     });
  // }, 1000);

  $: createInitialStars(container);

  // move the camera forward
  onTick((delta) => {
    //stars.forEach(updateStar);
    // world.step();
    // let pos = rigidBody.translation();
    // console.log(pos.x, pos.y);
  });

  // NOT PHYSICS RELATED

  let toastUpdate: toastUpdate = getContext("toast");

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

  export let chatClient: Client;

  onMount(async () => {
    starWipe();
    if (!chatClient) return;
    chatClient.on("chat", (channel, tags, message) => {
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

      let positionDrop = width * 0.9 + width * 0.05;
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
  });

  function drawing(graphics: PIXI.Graphics) {
    graphics.clear();
  }

  onDestroy(starWipe);
</script>

<Graphics bind:instance={container} draw={(graphics) => drawing(graphics)} />
