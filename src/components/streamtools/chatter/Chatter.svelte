<script>
  import "../../../js/tmi";
  import { onMount, afterUpdate } from "svelte";
  import ChatBubble from "./ChatBubble.svelte";
  export let params = { test: true };
  export let targetUser = "";
  export let runApp = false;
  let messageIndex = 0;

  let viewport, viewportHeight, bttvEmoteCache;

  import { formatEmotes } from "./messageParser";
  import { badge_sets } from "./badges.json";

  let userPronouns = new Map();
  let messageList = [];
  const pronouns = {
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

  async function fetchPronoun(username) {
    if (!params.pronouns || !username) return;
    let lowerCase = username.toLowerCase();
    if (userPronouns.get(lowerCase)) return;
    console.log(`...Looking for ${username} pronouns`);
    fetch(`https://pronouns.alejo.io/api/users/${lowerCase}`)
      .then((res) => res.json())
      .then((proData) => {
        if (!proData.length) {
          userPronouns.set(lowerCase, "");
          return;
        }
        console.log(`${lowerCase} has been set ${proData[0].pronoun_id} pronouns`);
        userPronouns.set(lowerCase, pronouns[proData[0].pronoun_id]);
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

  let badgeData = {};
  Object.keys(badge_sets).forEach((k) => {
    badgeData[k] = badge_sets[k];
  });

  function runMessage(channel, tags, message, self, type) {
    if (self) return;
    if (message === null) message = "";
    if (typeof params.hidebot === "object") {
      if (params.hidebot.includes(tags.username)) return;
    }
    if (typeof params.hidecom === "object") {
      let comCheck = message.split(" ")[0];
      if (params.hidecom.includes(comCheck)) return;
    }
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

    message = formatEmotes(message, tags.emotes, bttvEmoteCache, tags.bits, params);

    fetchPronoun(tags.username);
    userPronouns = userPronouns;
    let newChat = {
      message: message,
      user: tags.username,
      color: tags.color ? tags.color : params.highcolour,
      tags: tags,
      type: type,
    };
    if (!params.togglecol) newChat.color = params.highcolour;
    console.log(newChat, newChat.tags);
    if (type === "sub") {
      console.log("NEW SUB");
      console.log(newChat);
      newChat.tags.id = messageIndex.toString();
    } else {
      newChat.tags.id = message[0] + messageIndex.toString();
    }
    messageIndex++;
    if (params.direction === "Down") {
      messageList.push(newChat);
      if (messageList.length > 50) messageList.shift();
    }
    if (params.direction === "Up") {
      messageList.unshift(newChat);
      if (messageList.length > 50) messageList.pop();
    }
    messageList = messageList;
  }

  function removeUser(block) {
    messageList.forEach((msg, msgI) => {
      if (msg.user === block) messageList.splice(msgI, 1);
    });
    messageList = messageList;
  }

  onMount(async () => {
    console.log("Chatter has Loaded", params);

    firstMessage = true;
    const client = new tmi.Client({
      channels: [targetUser],
    });

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
      runMessage(false, { color: params.highcolour, "display-name": "Chatter", testing: true }, `Connected to ${targetUser} ✅`, false, "announcement");
    });

    client.on("chat", (channel, tags, message, self) => runMessage(channel, tags, message, self, "chat"));
    client.on("action", (channel, tags, message, self) => runMessage(channel, tags, message, self, "action"));
    client.on("cheer", (channel, tags, message, self) => runMessage(channel, tags, message, self, "cheer"));
    client.on("subscription", (channel, username, method, message, tags) => {
      console.log(channel, username, method, message, tags);
      runMessage(channel, tags, message, "sub");
    });
    client.on("resub", (channel, username, months, message, tags, methods) => runMessage(channel, tags, message, false, "sub"));
    client.on("announcement", (channel, tags, message) => runMessage(channel, tags, message, false, "announcement"));
    client.on("clearchat", () => (messageList = []));
    client.on("timeout", (channel, block) => removeUser(block));
    client.on("ban", (channel, block) => removeUser(block));

    if (params.channel) {
      console.log("Attempting Twitch Connection...");
      client.connect();
    }
  });
</script>

<section style={runApp ? "height:100vh" : ""}>
  <div id="chatBoundary" bind:this={viewport} bind:offsetHeight={viewportHeight} style="font-size: {params.fontsize + 'px'}; {params.customCSS}; align-items: {params.align}; {params.direction === 'Up' ? 'height:auto' : ''}">
    {#each messageList as message (message.tags.id)}
      <ChatBubble {params} {message} {badgeData} {userPronouns} />
    {/each}
    <div style="--bgOpacity:{params.bgopacity / 10}; --bgColour:{params.bgcolour}" id="chatBackground" />
  </div>
</section>

<style lang="scss">
  @import "../../../css/chatter.scss";
</style>
