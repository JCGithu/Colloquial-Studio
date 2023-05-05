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

  import { appInit, urlBuild, storage, reloadDashboard } from "../params";
  setContext("appDetails", appDetails);
  let toastUpdate: (i: string) => void;

  onMount(async () => {
    let baseURL = window.location.href;
    let urlData = new URLSearchParams(window.location.search);
    if (urlData.has("data")) window.location.replace(`${baseURL.split("?data")[0]}/app` + document.location.search);
    await appInit(appDetails.name, toastUpdate);
  });
</script>

<svelte:head>
  <title>Chatter - Dashboard</title>
</svelte:head>

<Dashboard bind:toastUpdate>
  <slot slot="app">
    {#key $storage[appDetails.name]["loaded"].channel}
      <Chatter />
    {/key}
  </slot>
  <slot id="dashControls" slot="settings">
    <DashChannel />
    <DashGrid>
      <DashInput type="select" name="Align" id="align" ops={{ Left: "flex-start", Center: "center", Right: "flex-end" }} />
      <DashInput faded={$storage[appDetails.name]["inProgress"].banner} type="select" name="Chat Direction" id="direction" ops={{ "From Bottom": "Down", "From Top": "Up" }} />
      <DashInput type="checkbox" name="Banner Mode" id="banner" />
    </DashGrid>
    <DashGroup title="Font Settings">
      <DashInput type="text" name="Custom Font" subtitle="You will need to put the exact font name installed on your computer" id="font" />
      <DashInput type="number" name="Font Size" id="fontsize" />
      <DashInput type="checkbox" name="Use Twitch Username Colours" id="nameCustom" />
      <DashInput faded={$storage[appDetails.name]["inProgress"].nameCustom} type="color" name="Font Colour" id="fontcolour" />
    </DashGroup>
    <DashGroup title="Chat Bubble">
      <DashInput type="range" name="Opacity" max={100} min={0} id="chatopacity" />
      <DashInput type="range" name="Roundness" max={100} min={0} id="border" />
      <DashInput type="checkbox" name="Use User Custom Colours" id="bubbleCustom" />
      <DashInput type="color" name="Default colour" id="chatcolour" faded={$storage[appDetails.name]["inProgress"].bubbleCustom} />
      <DashInput type="checkbox" name="Drop Shadow" id="highlight" />
    </DashGroup>
    {#if $storage[appDetails.name]["inProgress"]["highlight"]}
      <DashGroup title="Drop Shadow">
        <DashInput type="checkbox" name="Use User Custom Colours" subtitle="Chat shadow will use Twitch users custom colours, if they have one." id="togglecol" />
        <DashInput type="color" name="Default colour" id="highcolour" faded={$storage[appDetails.name]["inProgress"].togglecol} />
      </DashGroup>
    {/if}
    <DashGroup title="Background">
      <DashInput type="color" name="Background Colour" id="bgcolour" />
      <DashInput type="range" name="Opacity" max={100} min={0} id="bgopacity" />
    </DashGroup>
    <DashGroup title="Animation">
      <DashInput type="select" name="Animation" id="animation" ops={{ "Pop In": "Pop In", "Slide Left": "Slide Left", "Slide Right": "Slide Right", "Fade In": "Fade In", Grow: "Grow" }} />
      <DashInput type="number" name="Speed (seconds)" id="animTime" />
      <DashInput type="text" name="CSS Easing" id="animEase" />
    </DashGroup>
    <DashGroup title="Moderation">
      <DashInput type="text" name="Hide Users" subtitle="Split accounts with commas e.g. Nightbot, Streamelements" id="hidebot" />
      <DashInput type="text" name="Hide Commands" subtitle="Split with commas and write full command e.g. !play" id="hidecom" />
      <DashInput type="checkbox" name="Hide chat replies" id="replies" />
      <DashInput type="checkbox" name="Hide links" id="links" />
      <DashInput type="checkbox" name="Hide point redeems" id="points" />
    </DashGroup>
    <DashGroup title="Emotes">
      <DashInput type="checkbox" name="Show BTTV Emotes" id="bttv" />
      <DashInput type="checkbox" name="Show FFZ Emotes" id="ffz" />
      <DashInput type="checkbox" name="Wide Emote Command" subtitle="Chatters can put w! before emotes" id="wideEmotes" />
      <DashInput type="checkbox" subtitle="If a message is only emotes those will be shown larger" name="Big Emote Only Messages" id="emoteOnly" />
    </DashGroup>
    <DashInput type="checkbox" name="Show Badges" id="badges" />
    <DashInput type="checkbox" name="Set Chat On-Screen Duration" id="removeChats" />
    {#if $storage[appDetails.name]["inProgress"].removeChats}
      <DashGroup title="Remove Chats">
        <DashInput type="number" name="Chat Duration" subtitle="In seconds." id="removeTime" />
      </DashGroup>
    {/if}
    <DashInput type="checkbox" name="Show Pronouns" id="pronouns" />
    {#if $storage[appDetails.name]["inProgress"].pronouns}
      <DashGroup title="Pronouns">
        <DashInput type="text" name="Custom Font" subtitle="You will need to put the exact font name installed on your computer" id="proFont" />
        <DashInput type="checkbox" name="Outline" id="proOutline" />
        <DashInput type="checkbox" name="Use User Custom Colours" subtitle="Use Twitch users custom colours, if they have one." id="proUseCol" />
        <DashInput type="checkbox" name="Background" id="proBG" />
        <DashInput type="color" name="Default Colour" id="proColour" />
      </DashGroup>
    {/if}
  </slot>
</Dashboard>

<style lang="scss">
</style>
