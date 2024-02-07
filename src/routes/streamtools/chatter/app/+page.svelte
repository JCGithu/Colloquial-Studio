<script lang="ts">
  import ChatterLocked from "./ChatterLocked.svelte";
  import "../../../../css/default.scss";
  import { onMount } from "svelte";
  import { runningApp, storage } from "../../../toolParams";

  onMount(async () => {
    await runningApp(new URLSearchParams(window.location.search), "chatter");
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
  <ChatterLocked />
{/key}
