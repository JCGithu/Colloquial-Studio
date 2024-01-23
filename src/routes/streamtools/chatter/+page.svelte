<script lang="ts">
  let appDetails: appDetails = {
    name: "chatter",
    title: "Chatter",
    description: `Chatter is an on-screen chat for OBS/SLOBS. \n
    1. Enter a Twitch channel name. \n 2. Click Reload. \n 3. Style Chatter how you like! \n
    At the top you can find other settings, copy the URL, and save layouts.`,
  };
  let reload = 0;

  import Chatter from "./Chatter.svelte";
  import { setContext } from "svelte";
  import { storage } from "../../toolParams";
  import "../../../css/default.scss";
  import Dashboard from "../Dashboard.svelte";
  setContext("appDetails", appDetails);
  setContext("store", storage);
</script>

<svelte:head>
  <title>{appDetails.title} - Dashboard</title>
</svelte:head>

<Dashboard let:Dash>
  <slot slot="app">
    {#key reload}
      <Chatter />
    {/key}
  </slot>
  <slot id="dashControls">
    <Dash.Channel placeholder="In here!" on:refresh={() => reload++} bind:value={$storage.chatter.inProgress.channel} />
    <Dash.Grid>
      <Dash.Tab id="align" fill="rgb(36, 36, 35)" bind:value={$storage.chatter.inProgress.align} name="Align" options={{ Left: { value: "flex-start", icon: "align-left" }, Center: { value: "center", icon: "align-center" }, Right: { value: "flex-end", icon: "align-right" } }} />
      <Dash.Tab on:change={() => reload++} id="direction" fill="rgb(36, 36, 35)" bind:value={$storage.chatter.inProgress.direction} name="Chat Direction" options={{ Down: { value: "Down", icon: "arrow" }, Up: { value: "Up", icon: "arrow", rotate: 180 } }} faded={$storage.chatter.inProgress.banner} />
      <Dash.CheckBox name="Banner Mode" id="banner" faded={$storage.chatter.inProgress.shrink} bind:value={$storage.chatter.inProgress.banner} />
      <Dash.CheckBox name="Fit to Chat" id="shrink" faded={$storage.chatter.inProgress.banner} bind:value={$storage.chatter.inProgress.shrink} />
    </Dash.Grid>
    <Dash.Group title="Font Settings">
      <Dash.Text name="Custom Font" subtitle="You will need to put the exact font name installed on your computer" id="font" bind:value={$storage.chatter.inProgress.font} />
      <Dash.Number name="Font Size" id="fontsize" bind:value={$storage.chatter.inProgress.fontsize} />
      <Dash.CheckBox name="Use Twitch Username Colours" id="nameCustom" bind:value={$storage.chatter.inProgress.nameCustom} />
      <Dash.Colour id="fontcolour" name="Font Colour" faded={$storage.chatter.inProgress.nameCustom} bind:value={$storage.chatter.inProgress.fontcolour} />
    </Dash.Group>
    <Dash.Group title="Chat Bubble">
      <Dash.Range name="Opacity" max={100} min={0} id="chatopacity" bind:value={$storage.chatter.inProgress.chatopacity} />
      <Dash.Range name="Roundness" max={100} min={0} id="border" bind:value={$storage.chatter.inProgress.border} />
      <Dash.CheckBox name="Use User Custom Colours" id="bubbleCustom" bind:value={$storage.chatter.inProgress.bubbleCustom} />
      <Dash.Colour name="Default colour" id="chatcolour" faded={$storage.chatter.inProgress.bubbleCustom} bind:value={$storage.chatter.inProgress.chatcolour} />
      <Dash.CheckBox name="Drop Shadow" id="highlight" bind:value={$storage.chatter.inProgress.highlight} />
    </Dash.Group>
    {#if $storage.chatter.inProgress["highlight"]}
      <Dash.Group title="Drop Shadow">
        <Dash.CheckBox name="Use User Custom Colours" subtitle="Chat shadow will use Twitch users custom colours, if they have one." id="togglecol" bind:value={$storage.chatter.inProgress.togglecol} />
        <Dash.Colour name="Default colour" id="highcolour" faded={$storage.chatter.inProgress.togglecol} bind:value={$storage.chatter.inProgress.highcolour} />
      </Dash.Group>
    {/if}
    <Dash.Group title="Container">
      <Dash.Colour name="Background Colour" id="bgcolour" bind:value={$storage.chatter.inProgress.bgcolour} />
      <Dash.Range name="Opacity" max={100} min={0} id="bgopacity" bind:value={$storage.chatter.inProgress.bgopacity} />
      <Dash.Range name="Padding" min={0} max={3} step={0.1} id="padding" bind:value={$storage.chatter.inProgress.padding} />
      <Dash.CheckBox name="Fade Chat" id="fade" bind:value={$storage.chatter.inProgress.fade} />
    </Dash.Group>
    <Dash.Group title="Animation">
      <Dash.Select name="Animation" id="animation" options={{ "Pop In": "Pop In", "Slide Left": "Slide Left", "Slide Right": "Slide Right", "Fade In": "Fade In", Grow: "Grow", None: "None" }} bind:value={$storage.chatter.inProgress.animation} />
      <Dash.Number name="Speed (seconds)" id="animTime" bind:value={$storage.chatter.inProgress.animTime} />
      <Dash.Text name="CSS Easing" id="animEase" bind:value={$storage.chatter.inProgress.animEase} />
    </Dash.Group>
    <Dash.Group title="Moderation">
      <Dash.Text name="Hide Users" subtitle="Split accounts with commas e.g. Nightbot, Streamelements" id="hidebot" bind:value={$storage.chatter.inProgress.hidebot} />
      <Dash.Text name="Hide Commands" subtitle="Split with commas and write full command e.g. !play" id="hidecom" bind:value={$storage.chatter.inProgress.hidecom} />
      <Dash.CheckBox name="Hide chat replies" id="replies" bind:value={$storage.chatter.inProgress.replies} />
      <Dash.CheckBox name="Hide links" id="links" bind:value={$storage.chatter.inProgress.links} />
      <Dash.CheckBox name="Hide point redeems" id="points" bind:value={$storage.chatter.inProgress.points} />
    </Dash.Group>
    <Dash.Group title="Emotes">
      <Dash.CheckBox name="Show BTTV Emotes" id="bttv" bind:value={$storage.chatter.inProgress.bttv} />
      <Dash.CheckBox name="Show FFZ Emotes" id="ffz" bind:value={$storage.chatter.inProgress.ffz} />
      <Dash.CheckBox name="Wide Emote Command" subtitle="Chatters can put w! before emotes" id="wideEmotes" bind:value={$storage.chatter.inProgress.wideEmotes} />
      <Dash.CheckBox subtitle="If a message is only emotes those will be shown larger" name="Big Emote Only Messages" id="emoteOnly" bind:value={$storage.chatter.inProgress.emoteOnly} />
    </Dash.Group>
    <Dash.CheckBox name="Show Badges" id="badges" subtitle="Currently broken for custom subs! Working on it..." bind:value={$storage.chatter.inProgress.badges} />
    <Dash.CheckBox name="Set Chat On-Screen Duration" id="removeChats" bind:value={$storage.chatter.inProgress.removeChats} />
    {#if $storage.chatter.inProgress.removeChats}
      <Dash.Group title="Remove Chats">
        <Dash.Number name="Chat Duration" subtitle="In seconds." id="removeTime" bind:value={$storage.chatter.inProgress.removeTime} />
      </Dash.Group>
    {/if}
    <Dash.CheckBox name="Show Pronouns" id="pronouns" bind:value={$storage.chatter.inProgress.pronouns} />
    {#if $storage.chatter.inProgress.pronouns}
      <Dash.Group title="Pronouns">
        <Dash.Text name="Custom Font" subtitle="You will need to put the exact font name installed on your computer" id="proFont" bind:value={$storage.chatter.inProgress.proFont} />
        <Dash.CheckBox name="Use User Custom Colours" subtitle="Use Twitch users custom colours, if they have one." id="proUseCol" bind:value={$storage.chatter.inProgress.proUseCol} />
        {#if !$storage.chatter.inProgress.proUseCol}
          <Dash.Colour name="Text Colour" id="proColour" faded={$storage.chatter.inProgress.proUseCol} bind:value={$storage.chatter.inProgress.proColour} />
        {/if}
        <Dash.Tab id="Outline" name="Outline" fill="rgb(36, 36, 35)" bind:value={$storage.chatter.inProgress.proOutline} options={{ Off: { value: 1 }, User: { value: 2 }, Custom: { value: 3 } }} />
        {#if $storage.chatter.inProgress.proOutline === 3}
          <Dash.Colour name="Outline Colour" id="proOutColour" bind:value={$storage.chatter.inProgress.proOutColour} />
        {/if}
        <Dash.Tab id="proBG" name="Background" fill="rgb(36, 36, 35)" bind:value={$storage.chatter.inProgress.proBG} options={{ Off: { value: 1 }, User: { value: 2 }, Custom: { value: 3 } }} />
        {#if $storage.chatter.inProgress.proBG === 3}
          <Dash.Colour name="Background Colour" id="proOutColour" bind:value={$storage.chatter.inProgress.proBGColour} />
        {/if}
      </Dash.Group>
    {/if}
  </slot>
</Dashboard>

<style lang="scss">
</style>
