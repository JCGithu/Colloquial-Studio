<script lang="ts">
  import "../../../js/tmi";
  import type { Client } from "tmi.js";
  import { onMount, onDestroy } from "svelte";
  import { beforeNavigate } from "$app/navigation";

  let chatLog: Array<string> = [];
  let chatLogging = true;
  let chatLength = 25;

  let channels = ["colloquialowl"];
  let client: Client;
  onMount(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("channel")) {
      channels = [urlParams.get("channel")!];
    }
    //@ts-ignore
    client = new tmi.Client({ channels });
    client.on("connected", () => console.log("Reading from Twitch! ✅"));
    client.on("message", (channel, tags, message, self) => {
      if (!chatLogging) return;
      chatLog.push(tags.username + ": " + message);
      chatLog.push(JSON.stringify(tags));
      if (chatLog.length > chatLength * 2) {
        chatLog.shift();
        chatLog.shift();
      }
      chatLog = chatLog;
      console.log(chatLog);
    });
    client.on("raw_message", (cloned, message) => console.log(message.raw));
    client.connect();
  });

  function disconnectChat() {
    if (!client) return;
    client.disconnect().catch((error: string) => {
      console.log(error);
    });
  }
  beforeNavigate(disconnectChat);
  onDestroy(disconnectChat);
</script>

<svelte:head>
  <title>Chat Tester</title>
</svelte:head>

<body>
  <section>
    Raw chat input will be printed in console.
    <div>
      <label for="showLog">Show log on page</label>
      <input type="checkbox" id="showLog" bind:value={chatLogging} />
    </div>
    <div>
      <label for="logLength">Log Length</label>
      <input type="number" id="logLength" bind:value={chatLength} />
    </div>
  </section>

  <div id="log">
    {#each chatLog as chatBubble}
      <div>{chatBubble}</div>
    {/each}
  </div>
</body>

<style>
  * {
    font-family: "Helvetica";
  }
  body {
    width: 95%;
    margin: 0 !important;
    padding: 0 !important;
  }
  section {
    display: flex;
    flex-direction: column;
  }
  #logLength {
    width: 3rem;
  }
  #log {
    display: grid;
    grid-template-columns: 1fr 2fr;
    max-height: 90%;
    overflow-y: scroll;
  }
</style>
