<script lang="ts">
  import "../../../js/tmi";
  import type { Client, ChatUserstate, SubUserstate } from "tmi.js";
  import { onMount, getContext, afterUpdate } from "svelte";
  import { beforeNavigate } from "$app/navigation";
  import { storage } from "../../toolParams";
  import ChatBubble from "./ChatBubble.svelte";

  const toastUpdate: toastUpdate = getContext("toast");

  //export let params: ChatterParameters = defaultParams;
  export let runApp = false;
  let messageIndex = 0;

  let bttvEmoteCache: Array<bttvEmote>,
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
  async function fetchBadges(tags: ChatUserstate | SubUserstate) {
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
    if (self || !channel) return;
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
      fetchBadges(tags);
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

  let backupClient: Client;

  onMount(async () => {
    console.log("Chatter has Loaded", $storage.chatter.inProgress);
    window.onunhandledrejection = (e) => console.log("Error:", e);

    //@ts-ignore
    // It can't seem to find the export from the custom TMI.js
    let client: Client = new tmi.Client({
      channels: [$storage.chatter.inProgress.channel],
    }) as Client;
    backupClient = client;

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
      if ($storage.chatter.inProgress.ffz) ffzChannel($storage.chatter.inProgress.channel);
      testMessage(`Connected to ${$storage.chatter.inProgress.channel} ✅`, "announcement");
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

    if (!$storage.chatter.inProgress.version || $storage.chatter.inProgress.version !== 2) {
      testMessage("Chatter has had a major update! Please go back to the site and update your URL.", "announcement");
    }
    if ($storage.chatter.inProgress.channel === "" || !$storage.chatter.inProgress.channel) {
      testMessage("Give me a Twitch channel name to test! 📺", "announcement");
    } else {
      console.log("Attempting Twitch Connection...");
      client.connect().catch((error: string) => {
        console.log(error);
        if (!runApp) toastUpdate(`Error connecting to ${$storage.chatter.inProgress.channel}`, "error");
      });
    }
  });
  beforeNavigate(async () => {
    console.log("bye!");
    backupClient.disconnect().catch((error: string) => {
      console.log(error);
    });
  });
  // This is for the console really. Turning back on deleting chats when it's toggled on the dashboard
  let deletingChats = $storage.chatter.inProgress.removeChats;
  afterUpdate(() => {
    if (deletingChats === $storage.chatter.inProgress.removeChats) return;
    deletingChats = $storage.chatter.inProgress.removeChats;
    if ($storage.chatter.inProgress.removeChats === false) return;
    let intervalID = setInterval(() => {
      if (messageList.length > 0) {
        messageList.shift();
        messageList = messageList;
      } else {
        clearInterval(intervalID);
      }
    }, $storage.chatter.inProgress.removeTime * 1000);
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
  <div id="chatBoundary" class={$storage.chatter.inProgress.align} class:banner={$storage.chatter.inProgress.banner} style="font-size: {$storage.chatter.inProgress.fontsize + 'px'};--fontSize: {$storage.chatter.inProgress.fontsize + 'px'}; align-items: {$storage.chatter.inProgress.align};{$storage.chatter.inProgress.shrink ? 'height:auto; ' : ''}--padding:{$storage.chatter.inProgress.padding + 'rem'};">
    <div class="chatCrop" class:fade={$storage.chatter.inProgress.fade}>
      {#each messageList as message (message.tags.id)}
        <ChatBubble {message} {badgeData} />
      {/each}
    </div>
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
    height: calc(100% - (2 * var(--padding)));
    padding: var(--padding);
    flex-direction: var(--flex);
    overflow: hidden;
    //align-items: var(--align);
    justify-content: end;
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

  .fade {
    //background-color: red;
    -webkit-mask-image: linear-gradient(to top, black 95%, transparent 100%);
    mask-image: linear-gradient(to bottom, black 0%, transparent 100%);
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
    transition: 1s all ease-in-out;
  }
</style>
