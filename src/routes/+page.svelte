<script lang="ts">
  import "../css/default.scss";
  import { slide } from "svelte/transition";

  interface Folder {
    title: String;
    sub: String;
    list: Array<String>;
    on: Boolean;
  }

  let structure: Array<Folder> = [
    {
      title: "Games",
      sub: "games",
      list: ["twordle"],
      on: false,
    },
    {
      title: "Stream Tools",
      sub: "streamtools",
      list: ["chatter", "emotedrop"],
      on: false,
    },
  ];
</script>

<svelte:head>
  <title>Colloquial Studios</title>
</svelte:head>

<div>
  <h1>Colloquial Studios</h1>
  {#each structure as folder, i}
    <h2
      class="category"
      on:click={() => {
        folder.on = !folder.on;
      }}
    >
      {folder.title}
    </h2>
    {#if folder.on}
      <ul transition:slide|local>
        {#each folder.list as page}
          <li>
            <a href={`/${folder.sub}/${page}`}>
              {page}
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
