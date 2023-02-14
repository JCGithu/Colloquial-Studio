<script lang="ts">
  import type { ChatterParameters } from "./paramsChatter";
  import "../../../js/tmi";
  import { onMount } from "svelte";
  import ChatBubble from "./ChatBubble.svelte";
  import { defaultParams } from "./paramsChatter";

  export let params: ChatterParameters = defaultParams;
  export let runApp = false;
  let messageIndex = 0;

  let viewport, viewportHeight, bttvEmoteCache: Array<bttvEmoteIndividual>;

  import { formatEmotes } from "./messageParser";
  import { badge_sets } from "./badges.json";

  let exampleTags: Tags = {
    color: params.highcolour,
    "display-name": "Chatter",
    testing: true,
    id: "C0",
    username: "Chatter",
    "room-id": undefined,
    emotes: null,
    badges: {},
    "first-msg": false,
    mod: false,
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

  fetch("https://api.betterttv.net/3/cached/emotes/global")
    .then((response) => response.json())
    .then((data) => {
      bttvEmoteCache = data;
    })
    .catch((error) => {
      console.log(error);
    });

  let badgeData: BadgeData = {};
  Object.keys(badge_sets).forEach((k) => {
    badgeData[k] = (badge_sets as unknown as BadgeData)[k];
  });

  function runMessage(channel: ChatterParameters["channel"], tags: Tags, message: string, self: boolean, type: string) {
    if (self) return;
    if (typeof params.hidebot === "object") {
      if (params.hidebot.includes(tags.username)) return;
    }
    if (typeof params.hidecom === "object") {
      let comCheck = message.split(" ")[0];
      if (params.hidecom.includes(comCheck)) return;
    }
    if (params.links) {
      if (message.includes("http://") || message.includes("https://")) return;
    }
    if (params.points && tags["custom-reward-id"]) return;
    if (params.replies && tags["reply-parent-display-name"]) return;
    if (firstMessage && !tags.testing) {
      fetch(`https://badges.twitch.tv/v1/badges/channels/${tags["room-id"]}/display`)
        .then((response) => response.json())
        .then((data) => {
          Object.keys(data["badge_sets"]).forEach((k) => {
            badgeData[k] = data["badge_sets"][k];
          });
        })
        .catch((error) => {
          console.log(error);
        });
      fetch(`https://api.betterttv.net/3/cached/users/twitch/${tags["room-id"]}`)
        .then((response) => response.json())
        .then((data) => {
          for (let i in data.channelEmotes) {
            bttvEmoteCache.push(data.channelEmotes[i]);
          }
          for (let i in data.sharedEmotes) {
            bttvEmoteCache.push(data.sharedEmotes[i]);
          }
        })
        .catch((error) => {
          console.log(error);
        });
      firstMessage = false;
    }

    let messageArray = formatEmotes(message, tags.emotes, bttvEmoteCache, tags.bits, params);

    //fetchPronoun(tags.username);
    //userPronouns = userPronouns;

    let newChat: Message = {
      message: messageArray,
      user: tags.username || "",
      color: tags.color || params.highcolour,
      tags: tags,
      type: type,
      pronoun: undefined,
    };

    let lowerCase = newChat.user.toLowerCase();
    newChat.pronoun = userPronouns.get(lowerCase);
    if (params.pronouns && !newChat.pronoun) fetchPronoun(lowerCase);

    //if (!params.togglecol) newChat.color = params.highcolour;
    console.log(newChat, newChat.tags);
    if (type === "sub" || type === "announcement" || type === "test") {
      newChat.tags.id = messageIndex.toString();
    } else {
      newChat.tags.id = message[0] + messageIndex.toString();
    }
    if (params.direction === "Down") {
      messageList = messageList.concat(newChat);
      if (messageList.length > 50) messageList.shift();
    }
    if (params.direction === "Up") {
      messageList.unshift(newChat);
      if (messageList.length > 50) messageList.pop();
    }
    if (params.removeChats) {
      setTimeout(() => {
        messageList.shift();
        messageList = messageList;
      }, params.removeTime * 1000);
    }
    messageIndex++;
    messageList = messageList;
  }

  function removeUser(userToBlock: string) {
    messageList.forEach((msg, msgI) => {
      if (msg.user === userToBlock) messageList.splice(msgI, 1);
    });
    messageList = messageList;
  }

  onMount(async () => {
    console.log("Chatter has Loaded", params);

    firstMessage = true;
    // @ts-ignore
    let client = new tmi.Client({
      channels: [params.channel],
    });

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
      runMessage("", exampleTags, `Connected to ${params.channel} ✅`, false, "announcement");
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

    console.log(params.channel);
    setTimeout(() => {
      console.log("Attempting Twitch Connection...");
      client.connect();
    }, 1000);
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
  <div id="chatBoundary" bind:this={viewport} bind:offsetHeight={viewportHeight} style="font-size: {params.fontsize + 'px'}; {params.customCSS}; align-items: {params.align}; {params.direction === 'Up' ? 'height:auto' : ''}">
    {#each messageList as message (message.tags.id)}
      <ChatBubble {params} {message} {badgeData} />
    {/each}
    <div style="--bgOpacity:{params.bgopacity / 10}; --bgColour:{params.bgcolour}" id="chatBackground" />
  </div>
</section>

<style lang="scss">
  #chatBoundary {
    position: relative;
    --flex: column;
    --align: flex-start;
    display: flex;
    width: calc(100% - 1rem);
    height: calc(100% - 2rem);
    padding: 1rem;
    flex-direction: var(--flex);
    overflow: hidden;
    align-items: var(--align);
    justify-content: end;
  }

  section {
    min-width: 100%;
    min-height: 100%;
    //background-color: #262d36;
    border-radius: 1rem;
  }

  #chatBackground {
    --bgOpacity: 0;
    --bgColour: #262d36;

    background-color: var(--bgColour);
    opacity: var(--bgOpacity);
    position: absolute;
    border-radius: 1rem;
    left: 0;
    top: 0;
    min-width: calc(100% - 1rem);
    min-height: 100%;
    z-index: 0;
  }
</style>
