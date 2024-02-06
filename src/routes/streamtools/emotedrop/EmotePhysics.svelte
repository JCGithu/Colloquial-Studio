<script lang="ts">
  import { storage } from "../../toolParams";
  import "../../../js/tmi";
  import type { Client } from "tmi.js";
  import { onMount, onDestroy } from "svelte";

  export let width = 400;
  export let height = 400;

  import * as PIXI from "pixi.js";
  import { AnimatedGIF } from "@pixi/gif";
  import { Sprite, onTick, Container, Graphics } from "svelte-pixi";

  import type { World, Collider, RigidBody, Ball } from "@dimforge/rapier2d";
  import { loadWorld } from "./physics";

  export let rapier2d: RAPIER;
  export let world: World;
  let emoteMap: Map<number, mappedEmote> = new Map();
  let container: PIXI.Container;

  function starWipe() {
    world.forEachCollider((elt) => {
      let item = emoteMap.get(elt.handle);
      if (!item) return;
      deleteThisEmote(item, elt.handle);
    });
    loadWorld(rapier2d, world, width, height, true);
  }

  function getRandomInt(max: number) {
    return Math.floor(Math.random() * max);
  }

  $: defaultChart = [
    [5.5, $storage.emotedrop.inProgress.shape === 1 ? 0.15 : 0.1],
    [10, $storage.emotedrop.inProgress.shape === 1 ? 0.2 : 0.17],
    [13, $storage.emotedrop.inProgress.shape === 1 ? 0.25 : 0.225],
    [16, $storage.emotedrop.inProgress.shape === 1 ? 0.3 : 0.28],
    [20, $storage.emotedrop.inProgress.shape === 1 ? 0.375 : 0.35],
    [23, $storage.emotedrop.inProgress.shape === 1 ? 0.435 : 0.4],
    [26, $storage.emotedrop.inProgress.shape === 1 ? 0.5 : 0.46],
    [32, $storage.emotedrop.inProgress.shape === 1 ? 0.6 : 0.57],
    [37, $storage.emotedrop.inProgress.shape === 1 ? 0.7 : 0.65],
    [42, $storage.emotedrop.inProgress.shape === 1 ? 0.8 : 0.73],
    [47.5, $storage.emotedrop.inProgress.shape === 1 ? 0.9 : 0.85],
  ];
  let scaleChart = defaultChart;
  $: x2Chart = defaultChart.map(([x, y]) => [x, 2 * y]);
  $: x2_5Chart = defaultChart.map(([x, y]) => [x, 2.5 * y]);
  $: x4Chart = defaultChart.map(([x, y]) => [x, 4 * y]);

  $: {
    if ($storage.emotedrop.inProgress.quality === 2) {
      scaleChart = x2Chart;
    } else if ($storage.emotedrop.inProgress.quality === 1) {
      scaleChart = x4Chart;
    } else {
      scaleChart = defaultChart;
    }
  }
  $: removeTime = $storage.emotedrop.inProgress.time * 1000;

  const fullEmojiRegex = /[\u{1F300}-\u{1F6FF}]/gu;
  function extractEmojisFromString(inputString: string): Array<string> {
    const emojiMatches = inputString.match(fullEmojiRegex);
    let emojiArray: Array<string> = [];
    if (emojiMatches) {
      emojiMatches.forEach((v, i) => {
        let code = emojiMatches[i].codePointAt(0);
        let unicode = code?.toString(16);
        emojiArray.push(`https://cdn.jsdelivr.net/gh/twitter/twemoji@v14.0.2/assets/72x72/${unicode}.png`);
      });
    }
    return emojiArray;
  }

  //const check = (headers, options = { offset: 0 }) => buffers => headers.every((header, index) => header === buffers[options.offset + index]);
  function isPNG(uint8Array: Uint8Array) {
    return uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4e && uint8Array[3] === 0x47 && uint8Array[4] === 0x0d && uint8Array[5] === 0x0a && uint8Array[6] === 0x1a && uint8Array[7] === 0x0a;
  }

  function applyImgStats(curr: PIXI.Sprite | AnimatedGIF, scale: number, shape: Collider, body: RigidBody, x: number, y: number, rotation: number) {
    curr.anchor.set(0.5);
    curr.scale.set(scaleChart[scale][1]);
    curr.x = x;
    curr.y = y;
    curr.rotation = -rotation;
    emoteMap.set(shape.handle, { shape, body, curr, time: Date.now() });
    //@ts-ignore
    container.addChild(curr);
  }

  export let client: Client;

  onMount(async () => {
    starWipe();
    if (!client) return;
    client.on("chat", (channel, tags, message) => {
      // Deleting emotes
      if (message.startsWith("!emotewipe")) {
        let allowed = tags.badges?.broadcaster ? true : false;
        if ($storage.emotedrop.inProgress.modWipe && tags.badges?.moderator) allowed = true;
        if (!allowed) return;
        starWipe();
        return;
      }
      if (document.hidden) return;

      for (let i in tags.emotes) {
        for (let k in tags.emotes[i]) {
          addEmote(`https://static-cdn.jtvnw.net/emoticons/v2/${i}/default/light/${$storage.emotedrop.inProgress.quality}.0`, "twitch");
        }
      }

      let emojis = extractEmojisFromString(message);
      if (emojis.length) emojis.forEach((e) => addEmote(e, "emoji"));
    });

    async function addEmote(img: string, type: string) {
      let scale = $storage.emotedrop.inProgress.random ? getRandomInt(10) : $storage.emotedrop.inProgress.scale;
      let emoteChart = type === "twitch" ? scaleChart : x2_5Chart;
      let x = Math.random() * (width - 100) + 50;
      let y = Math.random() * -50;
      let rotation = Math.random() * 360;
      let bodyDesc = rapier2d.RigidBodyDesc.dynamic().setTranslation(x, y);
      let body = world.createRigidBody(bodyDesc);
      body.setAngularDamping(2);
      if ($storage.emotedrop.inProgress.gravity === 1) body.setGravityScale(0.5, true);
      body.setRotation(rotation, true);
      let colliderDesc = $storage.emotedrop.inProgress.shape === 1 ? rapier2d.ColliderDesc.ball(emoteChart[scale][0]) : rapier2d.ColliderDesc.cuboid(emoteChart[scale][0], emoteChart[scale][0]);
      let shape = world.createCollider(colliderDesc, body);
      shape.setDensity(2);
      shape.setFriction($storage.emotedrop.inProgress.friction / 5);
      shape.setRestitution($storage.emotedrop.inProgress.bounce / 8.5);
      if ($storage.emotedrop.inProgress.animated) {
        fetch(img)
          .then((res) => res.arrayBuffer())
          .then((buff) => {
            const uint8Array = new Uint8Array(buff);
            let png = isPNG(uint8Array);
            return [buff, png];
          })
          .then(([buff, png]) => {
            if (png) {
              return PIXI.Sprite.from(img);
            } else {
              //@ts-ignore
              return AnimatedGIF.fromBuffer(buff);
            }
          })
          .then((curr) => {
            applyImgStats(curr, scale, shape, body, x, y, rotation);
          });
      } else {
        let curr = PIXI.Sprite.from(img);
        applyImgStats(curr, scale, shape, body, x, y, rotation);
      }
    }
    //setInterval(async () => await addEmote(gifURL), 1000);
  });

  function deleteThisEmote(mappedEmote: mappedEmote, key: number) {
    emoteMap.delete(key);
    if (mappedEmote.body) world.removeRigidBody(mappedEmote.body);
    if (mappedEmote.curr) mappedEmote.curr.destroy();
  }

  function deleteFirstEmote() {
    let emote = emoteMap.values().next().value;
    let emoteKey = emoteMap.keys().next().value;
    deleteThisEmote(emote, emoteKey);
  }

  onTick((delta) => {
    world.step();
    if (delta > 0.6) world.step();
    if (delta > 0.9) world.step();
    world.forEachCollider((elt) => {
      let translation = elt.translation();
      let rotation = elt.rotation();
      let item = emoteMap.get(elt.handle);
      if (!item) return;
      item.curr.x = translation.x;
      item.curr.y = translation.y;
      item.curr.rotation = rotation;
      if ($storage.emotedrop.inProgress.timeon && item.time < Date.now() - removeTime) deleteThisEmote(item, elt.handle);
      // graphics.beginFill(0xde3249);
      // graphics.drawCircle(translation.x, translation.y, 20);
      // graphics.endFill();
    });
    if (emoteMap.size > $storage.emotedrop.inProgress.limit) deleteFirstEmote();
  });

  onDestroy(starWipe);
</script>

<Container bind:instance={container} />
