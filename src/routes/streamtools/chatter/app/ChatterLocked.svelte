<script lang="ts">
  import "../../../../js/tmi";
  import type { Client } from "tmi.js";
  import { onMount, onDestroy } from "svelte";
  import { beforeNavigate } from "$app/navigation";
  import { storage } from "../../../toolParams";
  import { defaultParams } from "../Chatter";
  import ChatBubble from "./ChatBubbleLocked.svelte";

  let messageIndex = 0;

  let bttvEmoteCache = new Map<string, string>();
  let ffzCache = new Map<string, string>();
  import { formatEmotes } from "../messageParser";
  import { badge_sets } from "../badges.json";
  import { initialFetches } from "../apiFetching";

  const { chatter } = $storage;
  const inProgress = chatter.inProgress;

  let exampleTags: Tags = {
    color: inProgress.highcolour,
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

  async function fetchPronoun(username: string) {
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

  let removeTimeS = inProgress.removeTime * 1000;

  function messageWrap(newChat: Message) {
    newChat.tags.id = `${newChat.message[0].text || "null"}${messageIndex}`;
    messageIndex++;
    if ((inProgress.banner && inProgress.align === "flex-start") || inProgress.direction === "Up") {
      messageList.unshift(newChat);
      if (messageList.length > inProgress.limit) messageList.pop();
    } else {
      messageList = messageList.concat(newChat);
      if (messageList.length > inProgress.limit) messageList.shift();
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
      color: inProgress.highcolour,
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
    if (typeof inProgress.hidebot === "object" && inProgress.hidebot.includes(tags.username)) return;
    if (inProgress.links && /https?:\/\//.test(message)) return;
    if (inProgress.points && tags["custom-reward-id"]) return;
    if (inProgress.replies && tags["reply-parent-display-name"]) return;

    let splitMessage = message.split(" ");

    if (typeof inProgress.hidecom === "object" && inProgress.hidecom.includes(splitMessage[0])) return;

    //Testing Commands
    if (tags.badges?.broadcaster && testCommands.includes(splitMessage[0])) {
      testMessage(message, splitMessage, splitMessage[0].slice(9));
      return;
    }

    let messageArray = formatEmotes(message, splitMessage, tags.emotes, bttvEmoteCache, ffzCache, tags.bits);
    let newChat: Message = {
      message: messageArray,
      user: tags.username,
      color: tags.color || inProgress.highcolour,
      tags: tags,
      type: type,
      pronoun: undefined,
      time: Date.now(),
    };
    let lowerCase = newChat.user.toLowerCase();
    newChat.pronoun = userPronouns.get(lowerCase);
    if ((inProgress.pronouns && !newChat.pronoun) || message === "!pronouns") fetchPronoun(lowerCase);
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
    console.log("Chatter has Loaded", inProgress);
    window.onunhandledrejection = (e) => console.log("Error:", e);

    if (inProgress.channel === "" || !inProgress.channel) {
      let testMessageString = "I don't have a Twitch account inputted! 📺";
      testMessage(testMessageString, testMessageString.split(" "), "announcement");
      return;
    }

    //@ts-ignore
    // It can't seem to find the export from the custom TMI.js
    client = new tmi.Client({
      channels: [inProgress.channel],
    });

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
      initialFetches(inProgress.channel, bttvEmoteCache, ffzCache, badgeData);
      testMessage(`Connected to ${inProgress.channel} ✅`, ["Connected", "To", inProgress.channel, "✅"], "announcement");
    });
    client.on("disconnected", () => {
      console.log("Disconnected from Twitch");
    });

    client.on("chat", (channel, tags, message, self) => runMessage(channel, tags, message, self, "chat"));
    client.on("action", (channel, tags, message, self) => runMessage(channel, tags, message, self, "action"));
    client.on("cheer", (channel, tags, message) => runMessage(channel, tags, message, false, "cheer"));
    client.on("subscription", (channel, username, method, message, tags) => {
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

    if (!inProgress.version || inProgress.version < defaultParams.version) {
      let testMessageString = "Chatter has an update! Please go back to the site and get a new URL.";
      testMessage(testMessageString, testMessageString.split(" "), "announcement");
    }

    try {
      await client.connect();
    } catch (error) {
      console.error(error);
      testMessage(`Error connecting to ${inProgress.channel}`, ["Error", "connecting", "to", inProgress.channel], "error");
    }

    let Up = inProgress.direction === "Up";
    if (inProgress.removeChats) {
      setInterval(() => {
        let current = Date.now();
        if (messageList[Up ? 0 : messageList.length - 1].time + removeTimeS < current) {
          Up ? messageList.shift() : messageList.pop();
          messageList = messageList;
        }
      }, 1000);
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

<section>
  <div id="chatBoundary" class={inProgress.align} class:banner={inProgress.banner} class:up={inProgress.direction === "Up"} class:shrink={inProgress.shrink} style="font-size: {inProgress.fontsize + 'px'};--fontSize: {inProgress.fontsize + 'px'}; align-items: {inProgress.align}; --padding:{inProgress.padding + 'rem'};">
    {#each messageList as message (message.tags.id)}
      <ChatBubble {message} {badgeData} {inProgress} />
    {/each}
    <div id="chatBackground" style:opacity={inProgress.bgopacity / 100} style:--bgColour={inProgress.bgcolour} style:height={inProgress.shrink ? "0px !important" : "auto"} />
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
    height: 100vh;
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
