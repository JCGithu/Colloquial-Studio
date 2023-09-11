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
    <Dash.Channel id="channel" />
    <Dash.Number name="Ball Limit *" id="blimit" />
    <Dash.Range name="Emote Size" id="esize" min={1} max={10} />
    <Dash.Range name="Bounce" id="bounce" min={0} max={10} />
    <Dash.Number name="Expiration Time" subtitle="(in seconds)" id="etime" />
    <Dash.CheckBox name="Randomise Size" id="random" />
    <Dash.CheckBox name="Adaptive Mode" subtitle="This stops the 'jelly' effect and makes the app run more effeciently. I'd recommend." id="sleep" />
    <Dash.CheckBox name="Let Mods Reset" subtitle="Allow mods to clear the screen with the command !emotewipe" id="modWipe" />
  </slot>
</Dashboard>

<style lang="scss">
</style>
