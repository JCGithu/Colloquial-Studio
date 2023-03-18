<script lang="ts">
  import "../css/default.scss";
  import { slide } from "svelte/transition";

  import logo from "../img/logo.svg";

  interface Folder {
    title: string;
    sub: string;
    list: Array<string>;
    links: Array<string>;
    on: boolean;
  }

  let structure: Array<Folder> = [
    {
      title: "Games",
      sub: "games",
      list: ["twordle", "alphabet challenge"],
      links: ["twordle", "alphabet"],
      on: false,
    },
    {
      title: "Stream Tools",
      sub: "streamtools",
      list: ["chatter", "emotedrop"],
      links: ["chatter", "emotedrop"],
      on: false,
    },
  ];
</script>

<svelte:head>
  <title>Colloquial Studios</title>
  <style>
    body {
      background-color: #fe5f55;
    }
  </style>
</svelte:head>

<div id="homePage">
  <img src={logo} alt="logo" id="logo" />
  <h1>colloquial</h1>
  {#each structure as folder, i}
    <h2
      class="category"
      class:open={folder.on}
      on:click={() => {
        folder.on = !folder.on;
      }}
      on:keypress={(e) => {
        if (e.key === "Enter") folder.on = !folder.on;
      }}
    >
      {folder.title}
    </h2>
    {#if folder.on}
      <ul transition:slide|local>
        {#each folder.list as page, j}
          <li>
            <a aria-label={page} href={`/${folder.sub}/${folder.links[j]}`}>
              {page}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  {/each}
</div>

<style lang="scss" global>
  @import "../css/colours.scss";

  #homePage {
    flex-direction: column;
    align-items: center;
    width: 100vw;
    height: 100vh;
    justify-content: center;
    display: flex;
    color: white;
    #logo {
      height: 100px;
    }

    ::selection {
      color: $colloquial;
      background: rgba(255, 255, 255, 0.7);
    }
    .category {
      cursor: pointer;
      transition: all 0.5s ease-in-out;
    }
    ul {
      margin: 0;
      text-transform: capitalize;
      text-align: center;
      padding: 0;
    }
    h1 {
      font-size: 30pt;
    }
    h2 {
      font-size: 15pt;
      margin: 0;
    }
    li {
      list-style: none;
      transition: 1s all cubic-bezier(0.075, 0.82, 0.165, 1);
      &:hover {
        transform: scale(1.1);
      }
    }
    .open {
      opacity: 0.5;
      &:hover {
        opacity: 0.7;
      }
    }
    a {
      text-decoration: none;
      color: white;
    }
  }
</style>
