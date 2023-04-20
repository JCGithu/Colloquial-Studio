<script lang="ts">
  import type { ChatterParameters } from "./paramsChatter";
  import "../../../js/tmi";
  import { onMount, getContext } from "svelte";
  import { storage } from "../params";
  import ChatBubble from "./ChatBubble.svelte";

  let toastUpdate: (i: string) => void = getContext("toast");

  //export let params: ChatterParameters = defaultParams;
  export let runApp = false;
  let messageIndex = 0;

  let viewport,
    viewportHeight,
    bttvEmoteCache: Array<bttvEmote>,
    ffzCache: Array<ffzEmote> = [];

  import { formatEmotes } from "./messageParser";
  import { badge_sets } from "./badges.json";

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
        if (!proData.length) {
          userPronouns.set(username, "");
        } else {
          userPronouns.set(username, pronouns[proData[0].pronoun_id]);
        }
        let newPronoun = userPronouns.get(username);
        if (newPronoun && newPronoun.length > 1) console.log(`${username} has been set ${newPronoun} pronouns`);
        messageList.forEach((msg) => {
          if (msg.user === username) msg.pronoun = newPronoun;
        });
        return;
      });
  }
  async function fetchBadges(tags: Tags) {
    const urls = [`https://badges.twitch.tv/v1/badges/channels/${tags["room-id"]}/display`, `https://api.betterttv.net/3/cached/users/twitch/${tags["room-id"]}`];

    try {
      const responses = await Promise.all(urls.map((url) => fetch(url)));
      const data = await Promise.all(responses.map((response) => response.json()));
      // Process the badge data
      Object.keys(data[0]["badge_sets"]).forEach((k) => {
        badgeData[k] = data[0]["badge_sets"][k];
      });
      console.log(badgeData);
      // Process the BTTV emotes
      for (let i in data[1].channelEmotes) {
        bttvEmoteCache.push(data[1].channelEmotes[i]);
      }
      for (let i in data[1].sharedEmotes) {
        bttvEmoteCache.push(data[1].sharedEmotes[i]);
      }
    } catch (error) {
      console.log(error);
    }
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

  let badgeData: BadgeData = {};
  Object.keys(badge_sets).forEach((k) => {
    badgeData[k] = (badge_sets as unknown as BadgeData)[k];
  });

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
        messageList.shift();
        messageList = messageList;
      }, $storage.chatter.inProgress.removeTime * 1000);
    }
    messageList = messageList;
  }

  function testMessage(message: string, type: string) {
    console.log("Test Message:", message, type);
    let messageArray = formatEmotes(message, exampleTags.emotes, bttvEmoteCache, ffzCache, exampleTags.bits);
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

  function runMessage(channel: ChatterParameters["channel"], tags: Tags, message: string, self: boolean, type: string) {
    if (self) return;
    if (typeof $storage.chatter.inProgress.hidebot === "object") {
      if ($storage.chatter.inProgress.hidebot.includes(tags.username)) return;
    }
    if (typeof $storage.chatter.inProgress.hidecom === "object") {
      let comCheck = message.split(" ")[0];
      if ($storage.chatter.inProgress.hidecom.includes(comCheck)) return;
    }
    if ($storage.chatter.inProgress.links) {
      if (message.includes("http://") || message.includes("https://")) return;
    }
    if ($storage.chatter.inProgress.points && tags["custom-reward-id"]) return;
    if ($storage.chatter.inProgress.replies && tags["reply-parent-display-name"]) return;

    //Testing Commands
    let testCommands = ["!chatter-sub", "!chatter-mod", "!chatter-vip", "!chatter-partner", "!chatter-user", "!chatter-bits"];
    if (tags.badges?.broadcaster) {
      let splitMessage = message.split(" ");
      if (testCommands.includes(splitMessage[0])) {
        testMessage(message.replace(splitMessage[0] + " ", ""), splitMessage[0].slice(9));
        return;
      }
    }

    if (firstMessage) {
      console.log("Chatter: First message, pulling badges");
      fetchBadges(tags);
      console.log(tags);
      firstMessage = false;
    }

    let messageArray = formatEmotes(message, tags.emotes, bttvEmoteCache, ffzCache, tags.bits);
    let newChat: Message = {
      message: messageArray,
      user: tags.username || "",
      color: tags.color || $storage.chatter.inProgress.highcolour,
      tags: tags,
      type: type,
      pronoun: undefined,
    };
    let lowerCase = newChat.user.toLowerCase();
    newChat.pronoun = userPronouns.get(lowerCase);
    if ($storage.chatter.inProgress.pronouns && !newChat.pronoun) fetchPronoun(lowerCase);
    console.log(newChat, newChat.tags);
    messageWrap(newChat);
  }

  function removeUser(userToBlock: string) {
    messageList.forEach((msg, msgI) => {
      if (msg.user === userToBlock) messageList.splice(msgI, 1);
    });
    messageList = messageList;
  }

  onMount(async () => {
    console.log("Chatter has Loaded", $storage.chatter.loaded);

    window.onunhandledrejection = (e) => {
      console.log("Error:", e);
      console.log($storage.chatter.loaded);
    };

    firstMessage = true;
    // @ts-ignore
    let client = new tmi.Client({
      channels: [$storage.chatter.loaded.channel],
    });

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
      if ($storage.chatter.inProgress.ffz) ffzChannel($storage.chatter.inProgress.channel);
      testMessage(`Connected to ${$storage.chatter.loaded.channel} ✅`, "announcement");
      if (!runApp) toastUpdate(`Connected to ${$storage.chatter.loaded.channel} ✅`);
    });

    client.on("chat", (channel: ChatterParameters["channel"], tags: Tags, message: string, self: boolean) => runMessage(channel, tags, message, self, "chat"));
    client.on("action", (channel: ChatterParameters["channel"], tags: Tags, message: string, self: boolean) => runMessage(channel, tags, message, self, "action"));
    client.on("cheer", (channel: ChatterParameters["channel"], tags: Tags, message: string, self: boolean) => runMessage(channel, tags, message, self, "cheer"));
    client.on("subscription", (channel: ChatterParameters["channel"], username: string, method: string, message: string, tags: Tags) => {
      console.log(channel, username, method, message, tags);
      runMessage(channel, tags, message, false, "sub");
    });
    client.on("resub", (channel: ChatterParameters["channel"], username: string, months: number, message: string, tags: Tags, methods: string) => runMessage(channel, tags, message, false, "sub"));
    client.on("announcement", (channel: ChatterParameters["channel"], tags: Tags, message: string) => runMessage(channel, tags, message, false, "announcement"));
    client.on("clearchat", () => (messageList = []));
    client.on("timeout", (channel: ChatterParameters["channel"], userToBlock: string) => removeUser(userToBlock));
    client.on("ban", (channel: ChatterParameters["channel"], userToBlock: string) => removeUser(userToBlock));

    if (!$storage.chatter.inProgress.version || $storage.chatter.inProgress.version !== 2) {
      testMessage("Chatter has had a major update! Please go back to the site and update your URL.", "announcement");
    }
    if ($storage.chatter.inProgress.channel === "" || !$storage.chatter.inProgress.channel) {
      testMessage("Give me a Twitch channel name to test! 📺", "announcement");
    } else {
      console.log("Attempting Twitch Connection...");
      client.connect();
    }
  });
</script>

<svelte:head>
  <style>
    body {
      overflow: hidden;
    }
  </style>
</svelte:head>

<section class:runApp>
  <div id="chatBoundary" bind:this={viewport} bind:offsetHeight={viewportHeight} class={$storage.chatter.inProgress.align} class:banner={$storage.chatter.inProgress.banner} style="font-size: {$storage.chatter.inProgress.fontsize + 'px'}; {$storage.chatter.inProgress.customCSS}; align-items: {$storage.chatter.inProgress.align}; {$storage.chatter.inProgress.direction === 'Up' ? 'height:auto' : ''}">
    {#each messageList as message (message.tags.id)}
      <ChatBubble {message} {badgeData} />
    {/each}
    <div style="opacity:{$storage.chatter.inProgress.bgopacity / 100}; --bgColour:{$storage.chatter.inProgress.bgcolour}" id="chatBackground" />
  </div>
</section>

<style lang="scss">
  #chatBoundary {
    position: relative;
    --flex: column;
    --align: flex-start;
    display: flex;
    width: calc(100% - 2rem);
    height: calc(100% - 2rem);
    padding: 1rem;
    flex-direction: var(--flex);
    overflow: hidden;
    align-items: var(--align);
    justify-content: end;
  }

  .banner {
    flex-direction: row !important;
    align-items: center !important;
  }

  .banner.flex-start {
    justify-content: flex-start !important;
  }

  section {
    min-width: 100%;
    min-height: 100%;
    //background-color: #262d36;
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
  }
</style>
