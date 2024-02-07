<script lang="ts">
  import EmoteDrop from "./EmoteDropLocked.svelte";
  import "../../../../css/default.scss";
  import { onMount } from "svelte";
  import { runningApp, storage } from "../../../toolParams";

  onMount(async () => {
    await runningApp(new URLSearchParams(window.location.search), "emotedrop");
  });
</script>

<svelte:head>
  <title>Emote Drop~{$storage.emotedrop.inProgress.channel}</title>
  <style>
    body {
      overflow: hidden;
    }
  </style>
</svelte:head>

{#key $storage.emotedrop.inProgress.channel}
  <EmoteDrop />
{/key}
