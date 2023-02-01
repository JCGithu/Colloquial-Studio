<script>
  import Dashboard from "../Dashboard.svelte";
  import DashInput from "../DashInput.svelte";
  import DashGroup from "../DashGroup.svelte";
  import DashButton from "../DashGroup.svelte";
  import "../../../css/default.scss";
  import { onMount, setContext } from "svelte";

  import { paramReformat, defaultParams } from "./paramsEmoteDrop";
  import * as paramFunctions from "../params";
  import EmoteDrop from "./EmoteDrop.svelte";

  //VARIABLES
  let appDetails = {
    name: "emotedrop",
    title: "Emote Drop",
    description: `This is an example`,
  };
  setContext("appDetails", appDetails);

  let [params, updateSettings] = Array(2).fill(new Object());
  let urlFill, baseURL;
  let runApp = false;
  let grouped = true;
  let targetUser;
  let toastUpdate;

  async function valueChanger(v) {
    console.log("====== INPUT CHANGE =========");
    params[v.detail.id] = v.detail.value;
    updateSettings = params;
    await paramReformat(params, v.detail.id);
    urlFill = paramFunctions.urlBuild(params, baseURL);
  }

  // This stays in here due to GUI.
  async function paramReload() {
    params = await paramReformat(params);
    updateSettings = params;
    targetUser = params.channel;
    toastUpdate("Channel reset");
  }

  async function loadURL({ detail }) {
    params = await paramFunctions.load(detail, paramReformat, false);
    urlFill = paramFunctions.urlBuild(params, baseURL);
    updateSettings = params;
  }

  async function paramReset() {
    defaultParams.saves = params.saves;
    params = await paramReformat(defaultParams);
    toastUpdate("Reset to default");
  }

  async function saveData({ detail }) {
    paramFunctions.save(params, "emotedrop", detail);
  }

  async function loadData({ detail }) {
    params = await paramFunctions.load(params.saves[detail], paramReformat, params.saves);
    urlFill = paramFunctions.urlBuild(params, baseURL);
    updateSettings = params;
  }

  onMount(async () => {
    baseURL = window.location.href;
    let urlData = new URLSearchParams(window.location.search);
    runApp = urlData.has("data");

    params = await paramFunctions.check(defaultParams, paramReformat, runApp, "emotedrop", urlData, toastUpdate);

    console.log("Dashboard Init", defaultParams, params);

    // APP SPECIFIC
    if (!params.version) params.fontsize = params.fontsize * 16;
    if (!params["chatcolourCalc"]) params["chatcolourCalc"] = params.chatcolour;
    //
    if (params.channel) {
      targetUser = params.channel;
    } else {
      targetUser = "";
    }
    updateSettings = params;
  });
</script>

<svelte:head>
  <style>
    body {
      overflow: hidden;
    }
  </style>
</svelte:head>

{#if runApp}
  {#key targetUser}
    <EmoteDrop {params} {targetUser} {runApp} />
  {/key}
{:else}
  <Dashboard {urlFill} on:loadURL={loadURL} on:loadData={loadData} on:saveData={saveData} saves={params.saves} bind:toastUpdate>
    <slot slot="title">Emote Drop</slot>
    <slot slot="subtitle">Made on stream over at <a href="https://twitch.tv/colloquialowl">ColloquialOwl</a></slot>
    <slot slot="description">
      Please input the channel of the Twitch chat you want to read. After picking your settings you can find the URL to put into OBS at the bottom!<br />
      <i>Channel Name is the only info required for it to work!</i>
    </slot>
    <slot slot="app">
      {#key targetUser}
        <EmoteDrop {params} {targetUser} {runApp} />
      {/key}
    </slot>
    <slot id="dashControls" slot="settings">
      <DashInput {params} type="text" name="Channel Name *" id="channel" on:valueChange={valueChanger} />
      <DashButton text="Reload!" on:click={paramReload} />
      <DashInput {params} type="number" name="Ball Limit *" id="blimit" on:valueChange={valueChanger} />
      <DashInput {params} type="range" subtitle="This is limited to three sizes due to how emotes are hosted on Twitch" name="Emote Size" id="esize" min="1" max="3" on:valueChange={valueChanger} />
      <DashInput {params} type="range" name="Bounce" id="bounce" min="0" max="10" on:valueChanger={valueChanger} />
      <DashInput {params} type="number" name="Expiration Time" subtitle="(in seconds)" id="etime" on:valueChange={valueChanger} />
      <DashButton text="Reset to Default" on:click={paramReload} />
    </slot>
  </Dashboard>
{/if}

<style lang="scss">
</style>
