<script lang="ts">
  // Add app and name
  import Chatter from "../Chatter.svelte";
  let appName: streamToolNames = "chatter";
  //

  import "../../../../css/default.scss";
  import { onMount } from "svelte";
  import { runningApp, storage } from "../../../toolParams";

  onMount(async () => {
    let urlData = new URLSearchParams(window.location.search);
    await runningApp(urlData, appName);
  });
</script>

<svelte:head>
  <title>Chatter~{$storage.chatter.inProgress.channel}</title>
  <style>
    body {
      overflow: hidden;
      max-height: 100vh;
    }
  </style>
</svelte:head>

{#key $storage.chatter.inProgress.channel}
  <Chatter runApp={true} />
{/key}
