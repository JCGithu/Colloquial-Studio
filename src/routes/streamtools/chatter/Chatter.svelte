<script lang="ts">
  import "../../../js/tmi";
  import type { Client, ChatUserstate, SubUserstate } from "tmi.js";
  import { onMount, getContext, afterUpdate, onDestroy } from "svelte";
  import { beforeNavigate } from "$app/navigation";
  import { storage } from "../../toolParams";
  import { defaultParams } from "./Chatter";
  import ChatBubble from "./ChatBubble.svelte";

  const toastUpdate: toastUpdate = getContext("toast");

  export let runApp = false;
  let messageIndex = 0;

  let bttvEmoteCache: Array<bttvEmote>,
    ffzCache: Array<ffzEmote> = [];

  import { formatEmotes } from "./messageParser";
  import { badge_sets } from "./badges.json";
  import Cell from "../../games/twordle/game/cell.svelte";
  import { error } from "@sveltejs/kit";

  let exampleTags: Tags = {
    color: $storage.chatter.inProgress.highcolour,
    "display-name": "Chatter",
    id: "C0",
    badges: {},
    username: "Chatter",
    "room-id": undefined,
    "first-msg": false,
    "msg-id": "",
    mod: false,
    turbo: false,
  };

  let userPronouns = new Map<string, string>();
  let messageList: Array<Message> = [];
  const pronouns: { [key: string]: string } = {
    aeaer: "Ae/Aer",
    any: "Any",
    eem: "E/Em",
    faefaer: "Fae/Faer",
    hehim: "He/Him",
    heshe: "He/She",
    hethem: "He/They",
    itits: "It/Its",
    other: "Other",
    perper: "Per/Per",
    sheher: "She/Her",
    shethem: "She/They",
    theythem: "They/Them",
    vever: "Ve/Ver",
    xexem: "Xe/Xem",
    ziehir: "Zie/Hir",
  };
  let firstMessage = true;

  async function fetchPronoun(username: string) {
    console.log(`...Looking for ${username} pronouns`);
    fetch(`https://pronouns.alejo.io/api/users/${username}`)
      .then((res) => res.json())
      .then((proData) => {
        let newPronoun = !proData.length ? "" : pronouns[proData[0].pronoun_id];
        userPronouns.set(username, newPronoun);
        if (newPronoun.length) console.log(`${username} has been set ${newPronoun} pronouns`);
        messageList.forEach((msg) => {
          if (msg.user === username) msg.pronoun = newPronoun;
        });
        return;
      });
  }

  let badgeData: BadgeData = {};
  Object.keys(badge_sets).forEach((k) => {
    badgeData[k] = (badge_sets as unknown as BadgeData)[k];
  });

  type ChatterWorker = Record<string, Record<string, string>>;
  async function fetchBadges(channel: string) {
    const chatterWorker = await fetch(`https://chatter-worker.colloquial.workers.dev/c/${channel}`)
      .then((res) => res.json())
      .then((data) => {
        return data as ChatterWorker;
      });
    let userID = chatterWorker.userID.id;
    let newBadges: BadgeData = {
      bits: {
        versions: {},
      },
      subscriber: {
        versions: {},
      },
    };
    Object.keys(chatterWorker.bits).forEach((k) => {
      newBadges.bits.versions[k] = {
        image_url_2x: chatterWorker.bits[k],
      };
    });
    Object.keys(chatterWorker.subscriber).forEach((k) => {
      newBadges.subscriber.versions[k] = {
        image_url_2x: chatterWorker.subscriber[k],
      };
    });
    badgeData = { ...badgeData, ...newBadges };
    await fetch(`https://api.betterttv.net/3/cached/users/twitch/${userID}`)
      .then((res) => res.json())
      .then((data) => {
        for (let i in data.channelEmotes) {
          bttvEmoteCache.push(data.channelEmotes[i]);
        }
        for (let i in data.sharedEmotes) {
          bttvEmoteCache.push(data.sharedEmotes[i]);
        }
      })
      .catch(error);
  }

  fetch("https://api.betterttv.net/3/cached/emotes/global")
    .then((response) => response.json())
    .then((data) => {
      bttvEmoteCache = data;
    })
    .catch((error) => {
      console.log(error);
    });

  fetch(`https://api.frankerfacez.com/v1/set/global`)
    .then((response) => response.json())
    .then((data) => {
      for (let [key, value] of Object.entries(data.sets as ffzData)) {
        ffzCache = ffzCache.concat(value.emoticons);
      }
    })
    .catch((error) => {
      console.log(error);
    });

  function ffzChannel(name: string) {
    fetch(`https://api.frankerfacez.com/v1/room/${name}`)
      .then((response) => response.json())
      .then((data) => {
        for (let [key, value] of Object.entries(data.sets as ffzData)) {
          ffzCache = ffzCache.concat(value.emoticons);
        }
        console.log(ffzCache);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  // This is broken out because the test and regular message use this.
  function messageWrap(newChat: Message) {
    newChat.tags.id = `${newChat.message[0].text || "null"}${messageIndex}`;
    messageIndex++;
    if (($storage.chatter.inProgress.banner && $storage.chatter.inProgress.align === "flex-start") || $storage.chatter.inProgress.direction === "Up") {
      messageList.unshift(newChat);
      if (messageList.length > 50) messageList.pop();
    } else {
      messageList = messageList.concat(newChat);
      if (messageList.length > 50) messageList.shift();
    }
    if ($storage.chatter.inProgress.removeChats) {
      setTimeout(() => {
        $storage.chatter.inProgress.direction === "Up" ? messageList.pop() : messageList.shift();
        messageList = messageList;
      }, $storage.chatter.inProgress.removeTime * 1000);
    }
    messageList = messageList;
  }

  function testMessage(message: string, splitText: Array<string>, type: string) {
    console.log("Test Message:", message, type);
    let messageArray = formatEmotes(message, splitText, exampleTags.emotes, bttvEmoteCache, ffzCache, exampleTags.bits);
    let newChat: Message = {
      message: messageArray,
      user: "Test_User",
      color: $storage.chatter.inProgress.highcolour,
      tags: Object.assign({}, exampleTags),
      type: type,
      pronoun: "Any",
    };
    if (type === "sub") Object.assign(newChat.tags, { badges: { subscriber: 0 } });
    if (type === "vip") Object.assign(newChat.tags, { badges: { vip: 1 } });
    if (type === "partner") Object.assign(newChat.tags, { badges: { partner: 1 } });
    if (type === "bits") newChat.tags.bits = 100;
    if (type === "mod") {
      Object.assign(newChat.tags, { badges: { moderator: 1 } });
      newChat.tags.mod = true;
    }
    if (type === "user") {
      Object.assign(newChat.tags, { "display-name": messageArray[0].text, username: messageArray[0].text });
      messageArray.shift();
      newChat.message = messageArray;
    }
    messageWrap(newChat);
  }

  let testCommands = ["!chatter-sub", "!chatter-mod", "!chatter-vip", "!chatter-partner", "!chatter-user", "!chatter-bits"];

  function runMessage(channel: ChatterParameters["channel"], tags: Tags, message: string, self: boolean, type: string) {
    if (self || !channel) return;
    if (typeof $storage.chatter.inProgress.hidebot === "object" && $storage.chatter.inProgress.hidebot.includes(tags.username)) return;
    if ($storage.chatter.inProgress.links && (message.includes("http://") || message.includes("https://"))) return;
    if ($storage.chatter.inProgress.points && tags["custom-reward-id"]) return;
    if ($storage.chatter.inProgress.replies && tags["reply-parent-display-name"]) return;

    let splitMessage = message.split(" ");

    if (typeof $storage.chatter.inProgress.hidecom === "object" && $storage.chatter.inProgress.hidecom.includes(splitMessage[0])) return;

    //Testing Commands
    if (tags.badges?.broadcaster) {
      if (testCommands.includes(splitMessage[0])) {
        testMessage(message, splitMessage, splitMessage[0].slice(9));
        return;
      }
    }

    let messageArray = formatEmotes(message, splitMessage, tags.emotes, bttvEmoteCache, ffzCache, tags.bits);
    let newChat: Message = {
      message: messageArray,
      user: tags.username,
      color: tags.color || $storage.chatter.inProgress.highcolour,
      tags: tags,
      type: type,
      pronoun: undefined,
    };
    let lowerCase = newChat.user.toLowerCase();
    newChat.pronoun = userPronouns.get(lowerCase);
    if (($storage.chatter.inProgress.pronouns && !newChat.pronoun) || message === "!pronouns") fetchPronoun(lowerCase);
    messageWrap(newChat);
  }

  function removeUser(userToBlock: string) {
    messageList.forEach((msg, msgI) => {
      if (msg.user === userToBlock) messageList.splice(msgI, 1);
    });
    messageList = messageList;
  }

  function removeMessage(messageToRemove: string, messageUser: string) {
    messageList.forEach((msg, msgI) => {
      if (msg.user === messageUser) {
        let fullMessage = "";
        msg.message.forEach((v) => {
          fullMessage = fullMessage + (fullMessage.length ? " " : "") + v.text;
        });
        console.log(fullMessage, messageToRemove);
        if (fullMessage === messageToRemove) messageList.splice(msgI, 1);
      }
    });
  }

  let client: Client;

  onMount(async () => {
    console.log("Chatter has Loaded", $storage.chatter.inProgress);
    window.onunhandledrejection = (e) => console.log("Error:", e);

    //@ts-ignore
    // It can't seem to find the export from the custom TMI.js
    client = new tmi.Client({
      channels: [$storage.chatter.inProgress.channel],
    }) as Client;

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
      if ($storage.chatter.inProgress.ffz) ffzChannel($storage.chatter.inProgress.channel);
      fetchBadges($storage.chatter.inProgress.channel);
      testMessage(`Connected to ${$storage.chatter.inProgress.channel} ✅`, ["Connected", "To", $storage.chatter.inProgress.channel, "✅"], "announcement");
      if (!runApp) toastUpdate(`Connected to ${$storage.chatter.inProgress.channel} ✅`, "pass");
    });
    client.on("disconnected", () => {
      console.log("Disconnected from Twitch");
    });

    client.on("chat", (channel, tags, message, self) => runMessage(channel, tags, message, self, "chat"));
    client.on("action", (channel, tags, message, self) => runMessage(channel, tags, message, self, "action"));
    client.on("cheer", (channel, tags, message) => runMessage(channel, tags, message, false, "cheer"));
    client.on("subscription", (channel, username, method, message, tags) => {
      console.log(channel, username, method, message, tags);
      runMessage(channel, tags, message, false, "sub");
    });
    client.on("resub", (channel, username, months, message, tags) => runMessage(channel, tags, message, false, "sub"));
    //@ts-ignore
    // Announcement is not in official TMI.js yet
    client.on("announcement", (channel: ChatterParameters["channel"], tags: Tags, message: string) => runMessage(channel, tags, message, false, "announcement"));
    client.on("clearchat", () => (messageList = []));
    client.on("timeout", (channel, userToBlock) => removeUser(userToBlock));
    client.on("ban", (channel, userToBlock) => removeUser(userToBlock));
    client.on("messagedeleted", (channel, username, deletedMessage, userstate) => removeMessage(deletedMessage, username));

    if (!$storage.chatter.inProgress.version || $storage.chatter.inProgress.version < defaultParams.version) {
      let testMessageString = "Chatter has an update! Please go back to the site and get a new URL.";
      testMessage(testMessageString, testMessageString.split(" "), "announcement");
    }
    if ($storage.chatter.inProgress.channel === "" || !$storage.chatter.inProgress.channel) {
      let testMessageString = "Give me a Twitch channel name to test! 📺";
      testMessage(testMessageString, testMessageString.split(" "), "announcement");
    } else {
      console.log("Attempting Twitch Connection...");
      client.connect().catch((error: string) => {
        console.log(error);
        if (!runApp) toastUpdate(`Error connecting to ${$storage.chatter.inProgress.channel}`, "error");
      });
    }
  });

  function destroyChatter() {
    if (!client) return;
    client.disconnect().catch((error: string) => {
      console.log(error);
    });
  }

  onDestroy(destroyChatter);
  beforeNavigate(destroyChatter);
</script>

<svelte:head>
  <style>
    body {
      overflow: hidden;
    }
  </style>
</svelte:head>

<section class:runApp>
  <div id="chatBoundary" class={$storage.chatter.inProgress.align} class:banner={$storage.chatter.inProgress.banner} class:up={$storage.chatter.inProgress.direction === "Up"} class:shrink={$storage.chatter.inProgress.shrink} style="font-size: {$storage.chatter.inProgress.fontsize + 'px'};--fontSize: {$storage.chatter.inProgress.fontsize + 'px'}; align-items: {$storage.chatter.inProgress.align}; --padding:{$storage.chatter.inProgress.padding + 'rem'};">
    {#each messageList as message (message.tags.id)}
      <ChatBubble {message} {badgeData} />
    {/each}
    <div id="chatBackground" style="opacity:{$storage.chatter.inProgress.bgopacity / 100}; --bgColour:{$storage.chatter.inProgress.bgcolour}; height:{$storage.chatter.inProgress.shrink ? '0px !important' : 'auto'}" />
  </div>
</section>

<style lang="scss">
  .runApp {
    height: 100vh;
  }
  #chatBoundary {
    position: relative;
    --flex: column;
    --align: flex-start;
    --padding: 1rem;
    display: flex;
    width: calc(100% - (2 * var(--padding)));
    --height: calc(100% - (2 * var(--padding)));
    height: var(--height);
    min-height: var(--height);
    padding: var(--padding);
    flex-direction: var(--flex);
    overflow: hidden;
    //align-items: var(--align);
    justify-content: end;
  }
  .up {
    justify-content: normal !important;
  }

  .chatCrop {
    display: flex;
    flex-direction: var(--flex);
    align-items: var(--align);
    justify-content: end;
    height: 100%;
    width: 100%;
    padding-bottom: 5px;
    overflow: hidden;
    z-index: 1;
  }

  .banner {
    flex-direction: row !important;
    align-items: center !important;
    height: auto !important;
    min-height: auto !important;
  }

  .banner.flex-start {
    justify-content: flex-start !important;
  }

  .shrink {
    height: auto !important;
    min-height: auto !important;
    max-height: calc(100% - 2 * (var(--padding))) !important;
  }

  section {
    min-width: 100%;
    min-height: calc(100% - 0.5rem);
    max-height: calc(100% - 0.5rem);
    padding-bottom: 0.5rem;
    border-radius: 1rem;
  }

  #chatBackground {
    --bgColour: #262d36;
    background-color: var(--bgColour);
    position: absolute;
    border-radius: 1rem;
    left: 0;
    top: 0;
    min-width: 100%;
    min-height: 100%;
    z-index: 0;
    transition: 1s all ease-in-out;
  }
</style>
