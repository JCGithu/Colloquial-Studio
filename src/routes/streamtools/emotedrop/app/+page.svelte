<script lang="ts">
  // Add app and name
  import EmoteDrop from "../EmoteDrop2.svelte";
  let appName: streamToolNames = "emotedrop";
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
  <title>Emote Drop~{$storage.emotedrop.inProgress.channel}</title>
</svelte:head>

{#key $storage.emotedrop.inProgress.channel}
  <EmoteDrop runApp={true} />
{/key}
