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
  import DashGroup from "../DashGroup.svelte";
  import DashButton from "../DashButton.svelte";
  import EmoteDrop from "./EmoteDrop.svelte";

  import { paramReformat, defaultParams } from "./paramsEmoteDrop";
  import { appInit, urlBuild } from "../params";
  setContext("appDetails", appDetails);

  let params = defaultParams;
  let updateSettings = defaultParams;
  let urlFill: string, baseURL: string, channelName: string;
  let toastUpdate: (i: string) => void;

  async function valueChanger(v: { detail: HTMLInputElement }) {
    console.log("====== INPUT CHANGE =========");
    if (v.detail.id === "channel") {
      urlFill = urlBuild(params, baseURL, channelName);
      return;
    }
    params[v.detail.id] = v.detail.value;
    updateSettings = params;
    await paramReformat(params, v.detail.id);
    urlFill = urlBuild(params, baseURL, channelName);
  }

  // This stays in here due to GUI.
  async function paramReload() {
    params["channel"] = channelName;
    params = await paramReformat(params);
    updateSettings = params;
    urlFill = urlBuild(params, baseURL, channelName);
    toastUpdate("Channel reset");
  }

  onMount(async () => {
    baseURL = window.location.href;
    let urlData = new URLSearchParams(window.location.search);
    if (urlData.has("data")) window.location.replace(`${baseURL.split("?data")[0]}/app` + document.location.search);
    params = await appInit(appDetails.name, toastUpdate);
    console.log("Dashboard Init", defaultParams, params);

    // APP SPECIFIC

    // KEEP
    updateSettings = params;
  });
</script>

<Dashboard {urlFill} bind:runningParams={updateSettings} bind:dashboardParams={params} bind:toastUpdate>
  <slot slot="app">
    {#key params.channel}
      <EmoteDrop {params} />
    {/key}
  </slot>
  <slot id="dashControls" slot="settings">
    <DashInput {params} type="text" name="Channel Name *" id="channel" bind:value={channelName} on:valueChange={valueChanger} />
    <DashButton text="Reload!" on:click={paramReload} />
    <!-- Insert from here -->
    <DashInput {params} type="number" name="Ball Limit *" id="blimit" on:valueChange={valueChanger} />
    <DashInput {params} type="range" name="Emote Size" id="esize" min="1" max="10" on:valueChange={valueChanger} />
    <DashInput {params} type="range" name="Bounce" id="bounce" min="0" max="10" on:valueChange={valueChanger} />
    <DashInput {params} type="number" name="Expiration Time" subtitle="(in seconds)" id="etime" on:valueChange={valueChanger} />
    <DashInput {params} type="checkbox" name="Randomise Size" id="random" on:valueChange={valueChanger} />
    <DashInput {params} type="checkbox" name="Adaptive Mode" subtitle="This stops the 'jelly' effect and makes the app run more effeciently. I'd recommend." id="sleep" on:valueChange={valueChanger} />
    <DashInput {params} type="checkbox" name="Let Mods Reset" subtitle="Allow mods to clear the screen with the command !emotewipe" id="modWipe" on:valueChange={valueChanger} />

    <!-- Insert to here -->
    <DashButton text="Reset to Default" on:click={paramReload} />
  </slot>
</Dashboard>

<style lang="scss">
</style>
