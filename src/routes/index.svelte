<script>
  import "../css/default.scss";
  import pullStructure from "../js/pullStructure";
  import { slide } from "svelte/transition";

  const modules = import.meta.glob("./*/*.svelte");
  let structure = pullStructure(modules);
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
  div {
    flex-direction: column;
  }
  .category {
    cursor: pointer;
  }
  ul {
    margin: 0;
    text-transform: capitalize;
    text-align: center;
    padding: 0;
  }
  h2 {
    text-transform: capitalize;
    margin: 0;
  }
  li {
    list-style: none;
    transition: 1s all cubic-bezier(0.075, 0.82, 0.165, 1);
    &:hover {
      transform: scale(1.05) translateX(1rem);
    }
  }
  a {
    text-decoration: none;
    color: red;
  }
</style>
