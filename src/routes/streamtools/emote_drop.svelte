<script>
  import Dashboard from "../../components/streamtools/Dashboard.svelte";
  let showDash = true;

  let pageData = {
    title: "Emote Drop!",
    subtitle: "Made on stream over at ColloquialOwl",
    description: `Please input the channel of the Twitch chat you want to pull the emotes from.
    Streamers and mods can wipe the screen with the !emotewipe command, or delete a set number e.g.<code> !emotewipe 5</code>.
    After picking your settings you can find the URL to put into OBS at the bottom!`,
  };
</script>

{#if showDash}
  <div id="dashBody">
    <Dashboard>
      <h1 slot="title">Emote Drop!</h1>
    </Dashboard>
  </div>
{:else}
  <h1>This is EMOTEDROP</h1>
{/if}

<style lang="scss">
  #dashBody {
    border-radius: 1rem;
    background-color: #d4d1ff;
    width: 90%;
    height: 90%;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: row;
  }
</style>
