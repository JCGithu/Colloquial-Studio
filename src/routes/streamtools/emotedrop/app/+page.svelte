<script lang="ts">
  // Add app and name
  import EmoteDrop from "../EmoteDrop.svelte";
  let appName = "emotedrop";
  import { defaultParams } from "../paramsEmoteDrop";
  //

  import "../../../../css/default.scss";
  import { onMount } from "svelte";
  import { runningApp } from "../../params";

  let params = defaultParams;
  let runApp = true;

  onMount(async () => {
    let urlData = new URLSearchParams(window.location.search);
    runApp = urlData.has("data");
    params = await runningApp(urlData, appName);

    // APP SPECIFIC
  });
</script>

<svelte:head>
  <title>Emote Drop</title>
</svelte:head>

{#key params.channel}
  <EmoteDrop {params} {runApp} />
{/key}
