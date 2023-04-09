<script lang="ts">
  // FOR NEW APP //
  // Change the details below
  // Add any app specific param settings in onMount
  // Add the dashboard options

  let appDetails = {
    name: "emotedrop",
    title: "Emote Drop",
    description: `Make emotes fall from the sky.`,
  };

  import { onMount, setContext } from "svelte";
  import "../../../css/default.scss";

  import Dashboard from "../Dashboard.svelte";
  import DashInput from "../DashInput.svelte";
  import DashGrid from "../components/DashGrid.svelte";
  import DashGroup from "../components/DashGroup.svelte";
  import DashChannel from "../components/DashChannel.svelte";
  import DashButton from "../components/DashButton.svelte";
  import EmoteDrop from "./EmoteDrop.svelte";

  import { appInit, urlBuild, storage, reloadDashboard } from "../params";
  setContext("appDetails", appDetails);
  let toastUpdate: (i: string) => void;

  async function paramReload() {
    reloadDashboard(appDetails.name);
    urlBuild(appDetails.name);
    toastUpdate("Channel reset");
  }

  onMount(async () => {
    let baseURL = window.location.href;
    let urlData = new URLSearchParams(window.location.search);
    if (urlData.has("data")) window.location.replace(`${baseURL.split("?data")[0]}/app` + document.location.search);
    await appInit(appDetails.name, toastUpdate);
  });
</script>

<svelte:head>
  <title>Emote Drop - Dashboard</title>
</svelte:head>

<Dashboard bind:toastUpdate>
  <slot slot="app">
    {#key $storage[appDetails.name]["loaded"].channel}
      <EmoteDrop />
    {/key}
  </slot>
  <slot id="dashControls" slot="settings">
    <DashChannel />
    <!-- Insert from here -->
    <DashInput type="number" name="Ball Limit *" id="blimit" />
    <DashInput type="range" name="Emote Size" id="esize" min={1} max={10} />
    <DashInput type="range" name="Bounce" id="bounce" min={0} max={10} />
    <DashInput type="number" name="Expiration Time" subtitle="(in seconds)" id="etime" />
    <DashInput type="checkbox" name="Randomise Size" id="random" />
    <DashInput type="checkbox" name="Adaptive Mode" subtitle="This stops the 'jelly' effect and makes the app run more effeciently. I'd recommend." id="sleep" />
    <DashInput type="checkbox" name="Let Mods Reset" subtitle="Allow mods to clear the screen with the command !emotewipe" id="modWipe" />
  </slot>
</Dashboard>

<style lang="scss">
</style>
