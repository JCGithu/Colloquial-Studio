<script lang="ts">
  import "../../../js/tmi";
  import type { Client } from "tmi.js";
  import { onMount, getContext, onDestroy } from "svelte";
  import { beforeNavigate } from "$app/navigation";
  import { storage } from "../../toolParams";
  import ChatBubble from "./ChatBubble.svelte";

  const toastUpdate: toastUpdate = getContext("toast");
  let messageIndex = 0;

  let bttvEmoteCache = new Map<string, string>();
  let ffzCache = new Map<string, string>();
  import { formatEmotes } from "./messageParser";
  import { badge_sets } from "./badges.json";
  import { initialFetches } from "./apiFetching";

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
  const pronouns: { [key: string]: string[] } = {
    aeaer: ["Ae", "Aer"],
    any: ["Any"],
    eem: ["E", "Em"],
    faefaer: ["Fae", "Faer"],
    hehim: ["He", "Him"],
    itits: ["It", "Its"],
    other: ["Other"],
    perper: ["Per", "Per"],
    sheher: ["She", "Her"],
    theythem: ["They", "Them"],
    vever: ["Ve", "Ver"],
    xexem: ["Xe", "Xem"],
    ziehir: ["Zie", "Hir"],
  };

  async function fetchPronoun(username: string) {
    fetch(`https://api.pronouns.alejo.io/v1/users/${username}`)
      .then((res) => {
        if (!res.ok) {
          userPronouns.set(username, "");
          return Promise.reject(new Error("No pronouns for user"));
        } else {
          return res.json();
        }
      })
      .then((proData) => {
        let newPronoun = pronouns[proData.pronoun_id][1] ? `${pronouns[proData.pronoun_id][0]}/${pronouns[proData.pronoun_id][1]}` : pronouns[proData.pronoun_id][0];
        if (proData.alt_pronoun_id) {
          newPronoun = `${pronouns[proData.pronoun_id][0]}/${pronouns[proData.alt_pronoun_id][1]}`;
        }
        userPronouns.set(username, newPronoun);
        if (newPronoun.length) console.log(`${username} has been set ${newPronoun} pronouns`);
        messageList.forEach((msg) => {
          if (msg.user === username) msg.pronoun = newPronoun;
        });
        messageList = messageList;
        return;
      });
  }

  let badgeData: BadgeData = {};
  Object.keys(badge_sets).forEach((k) => {
    badgeData[k] = (badge_sets as unknown as BadgeData)[k];
  });

  $: removeTimeS = $storage.chatter.inProgress.removeTime * 1000;
  // This is broken out because the test and regular message use this.
  function messageWrap(newChat: Message) {
    newChat.tags.id = `${newChat.message[0].text || "null"}${messageIndex}`;
    messageIndex++;
    if (($storage.chatter.inProgress.banner && $storage.chatter.inProgress.align === "flex-start") || $storage.chatter.inProgress.direction === "Up") {
      messageList.unshift(newChat);
      if (messageList.length > $storage.chatter.inProgress.limit) messageList.pop();
    } else {
      messageList = messageList.concat(newChat);
      if (messageList.length > $storage.chatter.inProgress.limit) messageList.shift();
    }
    messageList = messageList;
  }

  function testMessage(message: string, splitText: Array<string>, type: string) {
    console.log("Test Message:", message, type);
    let tempUser = "Chatter";
    if (splitText.length === 1) splitText[1] = tempUser;
    if (type != "announcement") {
      splitText.shift();
      if (splitText.length > 1) {
        tempUser = splitText[0];
        splitText.shift();
      }
    }
    let messageArray = formatEmotes(message, splitText, exampleTags.emotes, bttvEmoteCache, ffzCache, exampleTags.bits);
    let newChat: Message = {
      message: messageArray,
      user: "Test_User",
      color: $storage.chatter.inProgress.highcolour,
      tags: Object.assign({}, exampleTags),
      type: type,
      pronoun: "Any",
      time: Date.now(),
    };

    if (type === "sub") Object.assign(newChat.tags, { badges: { subscriber: 0 } });
    if (type === "vip") Object.assign(newChat.tags, { badges: { vip: 1 } });
    if (type === "partner") Object.assign(newChat.tags, { badges: { partner: 1 } });
    if (type === "bits") newChat.tags.bits = 100;
    if (type === "mod") {
      Object.assign(newChat.tags, { badges: { moderator: 1 } });
      newChat.tags.mod = true;
    }
    if (type != "announcement") Object.assign(newChat.tags, { "display-name": tempUser, username: tempUser });
    messageWrap(newChat);
  }

  let testCommands = ["!chatter-sub", "!chatter-mod", "!chatter-vip", "!chatter-partner", "!chatter-user", "!chatter-bits", "!chatter-first"];

  function runMessage(channel: ChatterParameters["channel"], tags: Tags, message: string, self: boolean, type: string) {
    if (self || !channel || !message) return;
    if (typeof $storage.chatter.inProgress.hidebot === "object" && $storage.chatter.inProgress.hidebot.includes(tags.username)) return;
    if ($storage.chatter.inProgress.links && /https?:\/\//.test(message)) return;
    if ($storage.chatter.inProgress.points && tags["custom-reward-id"]) return;
    if ($storage.chatter.inProgress.replies && tags["reply-parent-display-name"]) return;

    let splitMessage = message.split(" ");

    if (typeof $storage.chatter.inProgress.hidecom === "object" && $storage.chatter.inProgress.hidecom.includes(splitMessage[0])) return;

    //Testing Commands
    if (tags.badges?.broadcaster && testCommands.includes(splitMessage[0])) {
      testMessage(message, splitMessage, splitMessage[0].slice(9));
      return;
    }

    let messageArray = formatEmotes(message, splitMessage, tags.emotes, bttvEmoteCache, ffzCache, tags.bits);
    let newChat: Message = {
      message: messageArray,
      user: tags.username,
      color: tags.color || $storage.chatter.inProgress.highcolour,
      tags: tags,
      type: type,
      pronoun: undefined,
      time: Date.now(),
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
      if (msg.user != messageUser) return;
      let fullMessage = msg.message.map((v) => v.text).join(" ");
      if (fullMessage === messageToRemove) messageList.splice(msgI, 1);
    });
    messageList = messageList;
  }

  let client: Client;

  onMount(async () => {
    console.log("Chatter has Loaded", $storage.chatter.inProgress);
    window.onunhandledrejection = (e) => console.log("Error:", e);

    if ($storage.chatter.inProgress.channel === "" || !$storage.chatter.inProgress.channel) {
      let testMessageString = "Give me a Twitch channel name to test! 📺";
      testMessage(testMessageString, testMessageString.split(" "), "announcement");
      return;
    }

    //@ts-ignore
    // It can't seem to find the export from the custom TMI.js
    client = new tmi.Client({
      channels: [$storage.chatter.inProgress.channel],
    });

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
      initialFetches($storage.chatter.inProgress.channel, bttvEmoteCache, ffzCache, badgeData);
      testMessage(`Connected to ${$storage.chatter.inProgress.channel} ✅`, ["Connected", "To", $storage.chatter.inProgress.channel, "✅"], "announcement");
      toastUpdate(`Connected to ${$storage.chatter.inProgress.channel} ✅`, "pass");
    });
    client.on("disconnected", () => {
      console.log("Disconnected from Twitch");
    });

    client.on("chat", (channel, tags, message, self) => runMessage(channel, tags, message, self, "chat"));
    client.on("action", (channel, tags, message, self) => runMessage(channel, tags, message, self, "action"));
    client.on("cheer", (channel, tags, message) => runMessage(channel, tags, message, false, "cheer"));
    client.on("subscription", (channel, username, method, message, tags) => runMessage(channel, tags, message, false, "sub"));
    client.on("resub", (channel, username, months, message, tags) => runMessage(channel, tags, message, false, "sub"));
    //@ts-ignore
    // Announcement is not in official TMI.js yet
    client.on("announcement", (channel, tags, message) => runMessage(channel, tags, message, false, "announcement"));
    client.on("clearchat", () => (messageList = []));
    client.on("timeout", (channel, userToBlock) => removeUser(userToBlock));
    client.on("ban", (channel, userToBlock) => removeUser(userToBlock));
    client.on("messagedeleted", (channel, username, deletedMessage, userstate) => removeMessage(deletedMessage, username));

    try {
      await client.connect();
    } catch (error) {
      console.error(error);
      toastUpdate(`Error connecting to ${$storage.chatter.inProgress.channel}`, "error");
    }
    setInterval(() => {
      if (!$storage.chatter.inProgress.removeChats || !messageList.length) return;
      console.log("delete time");
      let current = Date.now();
      let Up = $storage.chatter.inProgress.direction != "Up";
      if (messageList[Up ? 0 : messageList.length - 1].time + removeTimeS < current) {
        Up ? messageList.shift() : messageList.pop();
        messageList = messageList;
      }
    }, 1000);
  });

  function destroyChatter() {
    if (!client) return;
    badgeData = {};
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

<section>
  <div id="chatBoundary" class={$storage.chatter.inProgress.align} class:banner={$storage.chatter.inProgress.banner} class:up={$storage.chatter.inProgress.direction === "Up"} class:shrink={$storage.chatter.inProgress.shrink} style="font-size: {$storage.chatter.inProgress.fontsize + 'px'};--fontSize: {$storage.chatter.inProgress.fontsize + 'px'}; align-items: {$storage.chatter.inProgress.align}; --padding:{$storage.chatter.inProgress.padding + 'rem'};">
    {#each messageList as message (message.tags.id)}
      <ChatBubble {message} {badgeData} />
    {/each}
    <div id="chatBackground" style="opacity:{$storage.chatter.inProgress.bgopacity / 100}; --bgColour:{$storage.chatter.inProgress.bgcolour}; height:{$storage.chatter.inProgress.shrink ? '0px !important' : 'auto'}" />
  </div>
</section>

<style lang="scss">
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
