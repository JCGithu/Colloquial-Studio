<script lang="ts">
  // Add app and name
  import Chatter from "../Chatter.svelte";
  let appName = "chatter";
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
  <title>Chatter</title>
</svelte:head>

{#key $storage.chatter["loaded"].channel}
  <Chatter runApp={true} />
{/key}
