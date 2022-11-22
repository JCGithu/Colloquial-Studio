<script>
  import "../../../js/tmi";
  import { onMount } from "svelte";
  export let params = { test: true };
  export let targetUser = "";
  export let runApp = false;

  let viewport, viewportHeight;

  onMount(async () => {
    console.log("Emote Drop has Loaded", params);

    const client = new tmi.Client({
      channels: [targetUser],
    });

    client.on("connected", () => {
      console.log("Reading from Twitch! ✅");
    });

    client.on("chat", (channel, tags, message, self) => {
      console.log(message);
    });

    if (params.channel) {
      console.log("Attempting Twitch Connection...");
      client.connect();
    }
  });
</script>

<section style={runApp ? "height:100vh" : ""}>
  <div id="chatBoundary" bind:this={viewport} bind:offsetHeight={viewportHeight} />
</section>

<style lang="scss">
  @import "../../../css/emotedrop.scss";
</style>
