<script lang="ts">
  // Add app and name
  import EmoteDrop from "../EmoteDrop.svelte";
  let appName = "emotedrop";
  //

  import "../../../../css/default.scss";
  import { onMount } from "svelte";
  import { runningApp, storage } from "../../params";

  onMount(async () => {
    let urlData = new URLSearchParams(window.location.search);
    await runningApp(urlData, appName);
  });
</script>

<svelte:head>
  <title>Emote Drop</title>
</svelte:head>

{#key $storage.emotedrop["loaded"].channel}
  <EmoteDrop runApp={true} />
{/key}
