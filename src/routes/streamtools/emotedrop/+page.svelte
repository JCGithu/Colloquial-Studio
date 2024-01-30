<script lang="ts">
  import { storage } from "../../toolParams";
  import { setContext } from "svelte";
  import "../../../css/default.scss";

  let appDetails: appDetails = {
    name: "emotedrop",
    title: "Emote Drop",
    description: `Make emotes fall from the sky.`,
  };
  let reload = 0;

  let resizeTimeout: NodeJS.Timeout;
  const resize = () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      reload++;
    }, 500);
  };

  import Dashboard from "../Dashboard.svelte";
  import EmoteDrop from "./EmoteDrop.svelte";
  setContext("appDetails", appDetails);
  setContext("store", storage);
</script>

<svelte:head>
  <title>{appDetails.title} - Dashboard</title>
</svelte:head>

<svelte:window on:resize={resize} />

<Dashboard let:Dash>
  <slot slot="app">
    {#key reload}
      <EmoteDrop />
    {/key}
  </slot>
  <slot id="dashControls">
    <Dash.Channel id="channel" placeholder="In here!" on:refresh={() => reload++} bind:value={$storage.emotedrop.inProgress.channel} />
    <Dash.Number name="Ball Limit" bind:value={$storage.emotedrop.inProgress.limit} />
    <Dash.CheckBox name="Randomise Size" bind:value={$storage.emotedrop.inProgress.random} faded={!$storage.emotedrop.inProgress.random} />
    {#if !$storage.emotedrop.inProgress.random}
      <Dash.Range name="Emote Size" min={0} max={10} bind:value={$storage.emotedrop.inProgress.scale} faded={$storage.emotedrop.inProgress.random} />
    {/if}
    <Dash.Tab name="Shape" fill="rgb(36, 36, 35)" bind:value={$storage.emotedrop.inProgress.shape} options={{ "Circle ⬤": { value: 1 }, "Square ◼": { value: 2 } }} />
    <Dash.Tab id="quality" name="Emote Quality" fill="rgb(36, 36, 35)" bind:value={$storage.emotedrop.inProgress.quality} options={{ Low: { value: 1 }, Mid: { value: 2 }, High: { value: 3 } }} />
    <Dash.Range name="Bounce" id="bounce" min={0} max={10} bind:value={$storage.emotedrop.inProgress.bounce} />
    <Dash.Range name="Friction" id="friction" min={0} max={10} bind:value={$storage.emotedrop.inProgress.friction} />
    <Dash.Tab name="Gravity" fill="rgb(36, 36, 35)" bind:value={$storage.emotedrop.inProgress.gravity} options={{ Low: { value: 1 }, Normal: { value: 2 } }} />
    <Dash.CheckBox name="Remove over time" bind:value={$storage.emotedrop.inProgress.timeon} />
    {#if $storage.emotedrop.inProgress.timeon}
      <Dash.Number name="Expiration Time" subtitle="(in seconds)" bind:value={$storage.emotedrop.inProgress.time} />
    {/if}
    <Dash.CheckBox name="Allow animated emotes" subtitle="Will lower performance" bind:value={$storage.emotedrop.inProgress.animated} />
    <Dash.CheckBox name="Let Mods Reset" subtitle="Mods can wipe all emotes with command !emotewipe" bind:value={$storage.emotedrop.inProgress.modWipe} />
  </slot>
</Dashboard>

<style lang="scss">
</style>
