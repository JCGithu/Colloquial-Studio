<script lang="ts">
  import { storage } from "../../toolParams";
  import "../../../js/tmi";
  import type { Client } from "tmi.js";
  import { onMount, onDestroy } from "svelte";

  export let width = 400;
  export let height = 400;

  import * as PIXI from "pixi.js";
  import { AnimatedGIF } from "@pixi/gif";
  import { onTick, Container } from "svelte-pixi";

  import type { World, Collider, RigidBody } from "@dimforge/rapier2d";
  import { loadWorld } from "./physics";

  export let rapier2d: RAPIER;
  export let world: World;
  let eventQueue = new rapier2d.EventQueue(true);
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

  function isPNG(uint8Array: Uint8Array) {
    return uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && uint8Array[2] === 0x4e && uint8Array[3] === 0x47 && uint8Array[4] === 0x0d && uint8Array[5] === 0x0a && uint8Array[6] === 0x1a && uint8Array[7] === 0x0a;
  }

  function applyImgStats(curr: PIXI.Sprite | AnimatedGIF, scale: number, scaleMap: number[], shape: Collider, body: RigidBody, x: number, y: number, rotation: number, code: string, img: string) {
    curr.anchor.set(0.5);
    curr.scale.set(scaleMap[1]);
    curr.x = x;
    curr.y = y;
    curr.rotation = -rotation;
    emoteMap.set(shape.handle, { shape, body, curr, time: Date.now(), scale, code, img });
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
          addNewEmote(`https://static-cdn.jtvnw.net/emoticons/v2/${i}/default/light/${$storage.emotedrop.inProgress.quality}.0`, "twitch", i);
        }
      }

      let emojis = extractEmojisFromString(message);
      if (emojis.length) emojis.forEach((e) => addNewEmote(e, "emoji"));
    });

    async function addNewEmote(img: string, type: string, code?: string) {
      let scaleSetting = $storage.emotedrop.inProgress.random ? getRandomInt(10) : $storage.emotedrop.inProgress.scale;
      let emoteChart = type === "twitch" ? scaleChart : x2_5Chart;
      let scaleMap = emoteChart[scaleSetting];
      let x = Math.random() * (width - 100) + 50;
      let y = Math.random() * -50;
      addEmote(img, scaleSetting, scaleMap, x, y, code);
    }
  });

  async function addEmote(img: string, scale: number, scaleMap: number[], x: number, y: number, code?: string) {
    let rotation = Math.random() * 360;
    let bodyDesc = rapier2d.RigidBodyDesc.dynamic().setTranslation(x, y).setCcdEnabled(true);
    let body = world.createRigidBody(bodyDesc);
    body.setAngularDamping(2);
    if ($storage.emotedrop.inProgress.gravity === 1) body.setGravityScale(0.5, true);
    body.setRotation(rotation, true);
    let colliderDesc = $storage.emotedrop.inProgress.shape === 1 ? rapier2d.ColliderDesc.ball(scaleMap[0]) : rapier2d.ColliderDesc.cuboid(scaleMap[0], scaleMap[0]);
    colliderDesc.setCollisionGroups(0x10001);
    let shape = world.createCollider(colliderDesc, body);
    shape.setActiveEvents(rapier2d.ActiveEvents.COLLISION_EVENTS);
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
          applyImgStats(curr, scale, scaleMap, shape, body, x, y, rotation, code || "", img);
        });
    } else {
      let curr = PIXI.Sprite.from(img);
      applyImgStats(curr, scale, scaleMap, shape, body, x, y, rotation, code || "", img);
    }
  }

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

  function findCenter(A: coordinate, B: coordinate): coordinate {
    let y = A.y === B.y ? A.y + 4 : (A.y + B.y) / 2;
    return { x: (A.x + B.x) / 2, y };
  }

  function suikaGame(emote1: mappedEmote, emote2: mappedEmote, handle1: number, handle2: number) {
    let whichEmote = emote1.scale >= emote2.scale;
    let scale = whichEmote ? emote1.scale : emote2.scale;
    let emote1Position = emote1.body.translation();
    let emote2Position = emote2.body.translation();
    if (scale < 10) scale++;
    let img = emote1.img;
    let code = emote1.code;
    let { x, y } = findCenter(emote1Position, emote2Position);
    deleteThisEmote(emote1, handle1);
    deleteThisEmote(emote2, handle2);
    let scaleMap = scaleChart[scale];
    addEmote(img, scale, scaleMap, x, y, code);
  }

  onTick((delta) => {
    world.step(eventQueue);
    if (delta > 0.6) world.step(eventQueue);
    if (delta > 0.9) world.step(eventQueue);
    eventQueue.drainCollisionEvents((handle1, handle2, started) => {
      if (!$storage.emotedrop.inProgress.suika) return;
      let emote1 = emoteMap.get(handle1);
      let emote2 = emoteMap.get(handle2);
      if (!emote1 || !emote2) return;
      if (emote1.code === emote2.code) suikaGame(emote1, emote2, handle1, handle2);
    });
    world.forEachCollider((elt) => {
      let translation = elt.translation();
      let rotation = elt.rotation();
      let item = emoteMap.get(elt.handle);
      if (!item) return;
      item.curr.x = translation.x;
      item.curr.y = translation.y;
      item.curr.rotation = rotation;
      if ($storage.emotedrop.inProgress.timeon && item.time < Date.now() - removeTime) deleteThisEmote(item, elt.handle);
    });
    if (emoteMap.size > $storage.emotedrop.inProgress.limit) deleteFirstEmote();
  });

  onDestroy(starWipe);
</script>

<Container bind:instance={container} />
