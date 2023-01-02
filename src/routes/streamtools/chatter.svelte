<script>
  import Dashboard from "../../components/streamtools/Dashboard.svelte";
  import DashInput from "../../components/streamtools/DashInput.svelte";
  import DashGroup from "../../components/streamtools/DashGroup.svelte";
  import Chatter from "../../components/streamtools/chatter/Chatter.svelte";
  import "../../css/default.scss";
  import { onMount } from "svelte";

  import { paramReformat, defaultParams } from "../../components/streamtools/chatter/paramsChatter";
  import * as paramFunctions from "../../components/streamtools/params";

  //VARIABLES
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
    params = await paramFunctions.load(detail, paramReformat, defaultParams, false);
    urlFill = paramFunctions.urlBuild(params, baseURL);
    updateSettings = params;
  }

  async function paramReset() {
    defaultParams.saves = params.saves;
    params = await paramReformat(defaultParams);
    toastUpdate("Reset to default");
  }

  async function saveData({ detail }) {
    paramFunctions.save(params, "chatter", detail);
  }

  async function loadData({ detail }) {
    let toLoad;
    if (!params.saves) {
      let localStore = window.localStorage.getItem("chatter");
    }
    params = await paramFunctions.load(params.saves[detail], paramReformat, params.saves);
    urlFill = paramFunctions.urlBuild(params, baseURL);
    updateSettings = params;
  }

  onMount(async () => {
    baseURL = window.location.href;
    let urlData = new URLSearchParams(window.location.search);
    runApp = urlData.has("data");

    params = await paramFunctions.check(defaultParams, paramReformat, runApp, "chatter", urlData, toastUpdate);

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
    <Chatter {params} {targetUser} {runApp} />
  {/key}
{:else}
  <Dashboard {urlFill} on:loadURL={loadURL} on:loadData={loadData} on:saveData={saveData} saves={params.saves} bind:toastUpdate>
    <slot slot="title">Chatter</slot>
    <slot slot="subtitle">Made on stream over at <a href="https://twitch.tv/colloquialowl">ColloquialOwl</a></slot>
    <slot slot="description">
      Please input the channel of the Twitch chat you want to read. After picking your settings you can find the URL to put into OBS at the bottom!<br />
      <i>Channel Name is the only info required for it to work!</i>
    </slot>
    <slot slot="app">
      {#key targetUser}
        <Chatter {params} {targetUser} />
      {/key}
    </slot>
    <slot id="dashControls" slot="settings">
      <h1>Chatter</h1>
      <DashInput {params} type="text" name="Channel Name *" id="channel" on:valueChange={valueChanger} />
      <button class="testButton" on:click={paramReload}>Reload</button>
      <DashInput
        {params}
        type="select"
        name="Align"
        id="align"
        ops={[
          { name: "Left", value: "flex-start" },
          { name: "Center", value: "center" },
          { name: "Right", value: "flex-end" },
        ]}
        on:valueChange={valueChanger}
      />
      <DashInput
        {params}
        type="select"
        name="Chat Direction"
        id="direction"
        ops={[
          { name: "From Bottom", value: "Down" },
          { name: "From Top", value: "Up" },
        ]}
        on:valueChange={valueChanger}
      />
      <DashGroup title="Font Settings">
        <DashInput {params} type="text" name="Custom Font" subtitle="You will need to put the exact font name installed on your computer" id="font" on:valueChange={valueChanger} />
        <DashInput {params} type="number" name="Font Size" id="fontsize" on:valueChange={valueChanger} />
        <DashInput {params} {grouped} type="checkbox" name="Use Twitch Username Colours" id="nameCustom" on:valueChange={valueChanger} />
        <DashInput {params} {grouped} faded={params.nameCustom} type="color" name="Font Colour" id="fontcolour" on:valueChange={valueChanger} />
      </DashGroup>
      <DashGroup title="Chat Bubble">
        <DashInput {params} type="range" name="Opacity" max="100" min="0" id="chatopacity" on:valueChange={valueChanger} />
        <DashInput {params} type="range" name="Roundness" max="10" min="0" id="border" on:valueChange={valueChanger} />
        <DashInput {params} {grouped} type="checkbox" name="Use User Custom Colours" id="bubbleCustom" on:valueChange={valueChanger} />
        <DashInput {params} {grouped} type="color" name="Default colour" id="chatcolour" faded={params.bubbleCustom} on:valueChange={valueChanger} />
        <DashInput {params} {grouped} type="checkbox" name="Drop Shadow" id="highlight" on:valueChange={valueChanger} />
      </DashGroup>
      {#if updateSettings.highlight}
        <DashGroup title="Bubble Drop Shadow">
          <DashInput {params} {grouped} type="checkbox" name="Use User Custom Colours" subtitle="Chat shadow will use Twitch users custom colours, if they have one." id="togglecol" on:valueChange={valueChanger} />
          <DashInput {params} {grouped} type="color" name="Default colour" id="highcolour" faded={params.togglecol} on:valueChange={valueChanger} />
        </DashGroup>
      {/if}
      <DashGroup title="Background">
        <DashInput {params} {grouped} type="color" name="Background Colour" id="bgcolour" on:valueChange={valueChanger} />
        <DashInput {params} type="range" name="Opacity" max="10" min="0" id="bgopacity" on:valueChange={valueChanger} />
      </DashGroup>
      <DashGroup title="Animation">
        <DashInput
          {params}
          {grouped}
          type="select"
          name="Animation"
          id="animation"
          ops={[
            { name: "Pop In", value: "Pop In" },
            { name: "Slide In", value: "Slide In" },
            { name: "Fade In", value: "Fade In" },
            { name: "Grow", value: "Grow" },
          ]}
          on:valueChange={valueChanger}
        />
        <DashInput {params} type="number" name="Speed" subtitle="In seconds. Accepts decimals." id="animTime" on:valueChange={valueChanger} />
        <DashInput {params} type="text" name="CSS Easing" id="animEase" on:valueChange={valueChanger} />
      </DashGroup>
      <DashGroup title="Moderation">
        <DashInput {params} type="text" name="Hide these bots" subtitle="Split accounts with commas e.g. Nightbot, Streamelements" id="hidebot" on:valueChange={valueChanger} />
        <DashInput {params} type="text" name="Hide these commands" subtitle="Split with commas and write full command e.g. !play" id="hidecom" on:valueChange={valueChanger} />
      </DashGroup>
      <DashGroup title="Advanced">
        <DashInput {grouped} {params} type="checkbox" name="Big Emote Only Messages" id="emoteOnly" on:valueChange={valueChanger} />
        <!--         <DashInput {params} type="text" name="Custom CSS" subtitle="Tutorial coming soon" id="customCSS" on:valueChange={valueChanger} /> -->
      </DashGroup>
      <DashInput {params} type="checkbox" name="Show Badges" id="badges" on:valueChange={valueChanger} />
      <DashInput {params} type="checkbox" name="Show BTTV Emotes" id="bttv" on:valueChange={valueChanger} />
      <DashInput {params} type="checkbox" name="Hide chat replies" id="replies" on:valueChange={valueChanger} />
      <DashInput {params} type="checkbox" name="Hide links" id="links" on:valueChange={valueChanger} />
      <DashInput {params} type="checkbox" name="Set Chat On-Screen Duration" id="removeChats" on:valueChange={valueChanger} />
      {#if updateSettings.removeChats}
        <DashInput {params} type="number" name="Chat Duration" subtitle="In seconds." id="removeTime" on:valueChange={valueChanger} />
      {/if}
      <DashInput {params} type="checkbox" name="Show Pronouns" id="pronouns" on:valueChange={valueChanger} />
      {#if updateSettings.pronouns}
        <DashGroup title="Pronouns">
          <DashInput {params} type="text" name="Custom Font" subtitle="You will need to put the exact font name installed on your computer" id="proFont" on:valueChange={valueChanger} />
          <DashInput {params} type="checkbox" name="Outline" id="proOutline" on:valueChange={valueChanger} />
          <DashInput {params} {grouped} type="checkbox" name="Use User Custom Colours" subtitle="Use Twitch users custom colours, if they have one." id="proUseCol" on:valueChange={valueChanger} />
          <DashInput {params} type="checkbox" name="Background" id="proBG" on:valueChange={valueChanger} />
          <DashInput {params} {grouped} type="color" name="Colour" id="proColour" on:valueChange={valueChanger} />
        </DashGroup>
      {/if}
      <button class="testButton" on:click={paramReset}>Reset to Default</button>
    </slot>
  </Dashboard>
{/if}

<style lang="scss">
  @import "../../css/dashboard.scss";
</style>
