<script lang="ts">
  // FOR NEW APP //
  // Change the details below
  // Add any app specific param settings in onMount
  // Add the dashboard options

  let appDetails = {
    name: "chatter",
    title: "Chatter",
    description: `Chatter is an on-screen chat for OBS/SLOBS. \n
    1. Enter a Twitch channel name. \n 2. Click Reload. \n 3. Style Chatter how you like! \n
    At the top you can find other settings, copy the URL, and save layouts.`,
  };

  import { onMount, setContext } from "svelte";
  import "../../../css/default.scss";

  import Dashboard from "../Dashboard.svelte";
  import DashInput from "../DashInput.svelte";
  import DashGrid from "../components/DashGrid.svelte";
  import DashGroup from "../components/DashGroup.svelte";
  import DashChannel from "../components/DashChannel.svelte";
  import DashButton from "../components/DashButton.svelte";
  import Chatter from "./Chatter.svelte";

  import { paramReformat, defaultParams } from "./paramsChatter";
  import { appInit, urlBuild } from "../params";
  setContext("appDetails", appDetails);

  let [params, updateSettings] = Array(2).fill(new Object());
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
    params = await paramReformat(params, null);
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
    if (!params.version) params.fontsize = params.fontsize * 16;
    if (!params["chatcolourCalc"]) params["chatcolourCalc"] = params.chatcolour;

    // KEEP
    updateSettings = params;
  });
</script>

<svelte:head>
  <title>Chatter - Dashboard</title>
</svelte:head>

<Dashboard {urlFill} bind:runningParams={updateSettings} bind:dashboardParams={params} bind:toastUpdate>
  <slot slot="app">
    {#key params.channel}
      <Chatter {params} />
    {/key}
  </slot>
  <slot id="dashControls" slot="settings">
    <DashChannel {params} bind:value={channelName} on:valueChange={valueChanger} on:reload={paramReload} />
    <DashGrid>
      <DashInput {params} type="select" name="Align" id="align" ops={{ Left: "flex-start", Center: "center", Right: "flex-end" }} on:valueChange={valueChanger} />
      <DashInput {params} type="select" name="Chat Direction" id="direction" ops={{ "From Bottom": "Down", "From Top": "Up" }} on:valueChange={valueChanger} />
    </DashGrid>
    <DashGroup title="Font Settings">
      <DashInput {params} type="text" name="Custom Font" subtitle="You will need to put the exact font name installed on your computer" id="font" on:valueChange={valueChanger} />
      <DashInput {params} type="number" name="Font Size" id="fontsize" on:valueChange={valueChanger} />
      <DashInput {params} type="checkbox" name="Use Twitch Username Colours" id="nameCustom" on:valueChange={valueChanger} />
      <DashInput {params} faded={params.nameCustom} type="color" name="Font Colour" id="fontcolour" on:valueChange={valueChanger} />
    </DashGroup>
    <DashGroup title="Chat Bubble">
      <DashInput {params} type="range" name="Opacity" max="100" min="0" id="chatopacity" on:valueChange={valueChanger} />
      <DashInput {params} type="range" name="Roundness" max="100" min="0" id="border" on:valueChange={valueChanger} />
      <DashInput {params} type="checkbox" name="Use User Custom Colours" id="bubbleCustom" on:valueChange={valueChanger} />
      <DashInput {params} type="color" name="Default colour" id="chatcolour" faded={params.bubbleCustom} on:valueChange={valueChanger} />
      <DashInput {params} type="checkbox" name="Drop Shadow" id="highlight" on:valueChange={valueChanger} />
    </DashGroup>
    {#if updateSettings.highlight}
      <DashGroup title="Bubble Drop Shadow">
        <DashInput {params} type="checkbox" name="Use User Custom Colours" subtitle="Chat shadow will use Twitch users custom colours, if they have one." id="togglecol" on:valueChange={valueChanger} />
        <DashInput {params} type="color" name="Default colour" id="highcolour" faded={params.togglecol} on:valueChange={valueChanger} />
      </DashGroup>
    {/if}
    <DashGroup title="Background">
      <DashInput {params} type="color" name="Background Colour" id="bgcolour" on:valueChange={valueChanger} />
      <DashInput {params} type="range" name="Opacity" max="100" min="0" id="bgopacity" on:valueChange={valueChanger} />
    </DashGroup>
    <DashGroup title="Animation">
      <DashInput {params} type="select" name="Animation" id="animation" ops={{ "Pop In": "Pop In", "Slide In": "Slide In", "Fade In": "Fade In", Grow: "Grow" }} on:valueChange={valueChanger} />
      <DashInput {params} type="number" name="Speed" subtitle="In seconds. Accepts decimals." id="animTime" on:valueChange={valueChanger} />
      <DashInput {params} type="text" name="CSS Easing" id="animEase" on:valueChange={valueChanger} />
    </DashGroup>
    <DashGroup title="Moderation">
      <DashInput {params} type="text" name="Hide Users" subtitle="Split accounts with commas e.g. Nightbot, Streamelements" id="hidebot" on:valueChange={valueChanger} />
      <DashInput {params} type="text" name="Hide Commands" subtitle="Split with commas and write full command e.g. !play" id="hidecom" on:valueChange={valueChanger} />
      <DashInput {params} type="checkbox" name="Hide chat replies" id="replies" on:valueChange={valueChanger} />
      <DashInput {params} type="checkbox" name="Hide links" id="links" on:valueChange={valueChanger} />
    </DashGroup>
    <DashGroup title="Emotes">
      <DashInput {params} type="checkbox" name="Show BTTV Emotes" id="bttv" on:valueChange={valueChanger} />
      <DashInput {params} type="checkbox" name="Show FFZ Emotes" id="ffz" on:valueChange={valueChanger} />
      <DashInput {params} type="checkbox" subtitle="If a message is only emotes those will be shown larger" name="Big Emote Only Messages" id="emoteOnly" on:valueChange={valueChanger} />
    </DashGroup>
    <DashInput {params} type="checkbox" name="Show Badges" id="badges" on:valueChange={valueChanger} />
    <DashInput {params} type="checkbox" name="Hide point redeems" id="points" on:valueChange={valueChanger} />
    <DashInput {params} type="checkbox" name="Set Chat On-Screen Duration" id="removeChats" on:valueChange={valueChanger} />
    {#if updateSettings.removeChats}
      <DashGroup title="Remove Chats">
        <DashInput {params} type="number" name="Chat Duration" subtitle="In seconds." id="removeTime" on:valueChange={valueChanger} />
      </DashGroup>
    {/if}
    <DashInput {params} type="checkbox" name="Show Pronouns" id="pronouns" on:valueChange={valueChanger} />
    {#if updateSettings.pronouns}
      <DashGroup title="Pronouns">
        <DashInput {params} type="text" name="Custom Font" subtitle="You will need to put the exact font name installed on your computer" id="proFont" on:valueChange={valueChanger} />
        <DashInput {params} type="checkbox" name="Outline" id="proOutline" on:valueChange={valueChanger} />
        <DashInput {params} type="checkbox" name="Use User Custom Colours" subtitle="Use Twitch users custom colours, if they have one." id="proUseCol" on:valueChange={valueChanger} />
        <DashInput {params} type="checkbox" name="Background" id="proBG" on:valueChange={valueChanger} />
        <DashInput {params} type="color" name="Default Colour" id="proColour" on:valueChange={valueChanger} />
      </DashGroup>
    {/if}
    <DashButton text="Reset to Default" on:click={paramReload} />
  </slot>
</Dashboard>

<style lang="scss">
</style>
