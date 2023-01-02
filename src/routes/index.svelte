<script>
  import "../css/default.scss";
  import { slide } from "svelte/transition";

  let structure = {
    games: {
      list: ["twordle"],
      on: false,
    },
    streamtools: {
      list: ["chatter", "emotedrop"],
      on: false,
    },
  };
  let folders = Object.keys(structure);

  let test = true;
</script>

<svelte:head>
  <title>Colloquial Studios</title>
</svelte:head>

<div>
  <h1>Colloquial Studios</h1>
  {#each folders as folder, i}
    <h2
      class="category"
      on:click={() => {
        structure[folder].on = !structure[folder].on;
      }}
    >
      {folder.replace("_", " ")}
    </h2>
    {#if structure[folder].on}
      <ul transition:slide|local>
        {#each structure[folder].list as page}
          <li>
            <a href={`/${folder}/${page}`}>
              {page.replace("_", " ")}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  {/each}
</div>

<style lang="scss">
  @import "../css/index.scss";
</style>
