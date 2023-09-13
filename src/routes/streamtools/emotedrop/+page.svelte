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

  import Dashboard from "../Dashboard.svelte";
  import EmoteDrop from "./EmoteDrop.svelte";
  setContext("appDetails", appDetails);
  setContext("store", storage);
</script>

<svelte:head>
  <title>{appDetails.title} - Dashboard</title>
</svelte:head>

<Dashboard let:Dash>
  <slot slot="app">
    {#key reload}
      <EmoteDrop />
    {/key}
  </slot>
  <slot id="dashControls">
    <Dash.Channel id="channel" placeholder="In here!" on:refresh={() => reload++} bind:value={$storage.emotedrop.inProgress.channel} />
    <Dash.Number name="Ball Limit" bind:value={$storage.emotedrop.inProgress.blimit} />
    <Dash.Range name="Emote Size" min={1} max={10} bind:value={$storage.emotedrop.inProgress.esize} faded={$storage.emotedrop.inProgress.random} />
    <Dash.Range name="Bounce" id="bounce" min={0} max={10} bind:value={$storage.emotedrop.inProgress.bounce} />
    <Dash.Number name="Expiration Time" subtitle="(in seconds)" bind:value={$storage.emotedrop.inProgress.etime} />
    <Dash.CheckBox name="Randomise Size" bind:value={$storage.emotedrop.inProgress.random} />
    <Dash.CheckBox name="Adaptive Mode" subtitle="Stops the 'jelly' effect and runs more effeciently. Recommended." bind:value={$storage.emotedrop.inProgress.sleep} />
    <Dash.CheckBox name="Let Mods Reset" subtitle="Mods can wipe all emotes with command !emotewipe" bind:value={$storage.emotedrop.inProgress.modWipe} />
  </slot>
</Dashboard>

<style lang="scss">
</style>
