<script lang="ts">
  import "../css/default.scss";
  import { slide } from "svelte/transition";

  import logo from "../img/logo.svg";
  import Noise from "../components/Noise.svelte";

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
      links: ["/games/twordle", "/games/alphabet"],
      on: false,
    },
    {
      title: "Stream Tools",
      sub: "streamtools",
      list: ["chatter", "emotedrop"],
      links: ["/streamtools/chatter", "/streamtools/emotedrop"],
      on: false,
    },
    {
      title: "Chrome Extensions",
      sub: "chromeextensions",
      list: ["Storygraph Printer"],
      links: ["https://chromewebstore.google.com/detail/storygraph-printer/piamaldolnicniajehjlgnmnlljnfcal"],
      on: false,
    },
  ];
  let footerLinks = [
    { slug: "changelog", title: "ChangeLog" },
    { slug: "donate", title: "Donate" },
    { slug: "newsletter", title: "Newsletter" },
  ];
</script>

<svelte:head>
  <title>Colloquial</title>
  <style>
    body {
      background-color: #fe5f55;
    }
  </style>
</svelte:head>

<main id="homePage" class="addNoise">
  <img src={logo} alt="logo" id="logo" />
  <h1>colloquial</h1>
  {#each structure as folder}
    <button
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
    </button>
    {#if folder.on}
      <ul transition:slide|local>
        {#each folder.list as page, j}
          <li>
            <a aria-label={page} href={folder.links[j]}>
              {page}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  {/each}
  <footer>
    {#each footerLinks as link}
      <a href="/{link.slug}">{link.title}</a>
    {/each}
  </footer>
  <Noise />
</main>

<style lang="scss" global>
  @use "../css/default.scss" as *;
  @use "../css/colours.scss" as *;

  main {
    font-family: "Poppins";
  }

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
      background: white;
      border-radius: 1rem !important;
      overflow: hidden !important;
      padding: 10rem;
      margin: 100px;
      transform: scale(2) !important;
    }

    ul {
      margin: 0;
      text-transform: capitalize;
      text-align: center;
      padding: 0;
    }
    h1 {
      font-size: 30pt;
      border-radius: 1rem !important;
      overflow: hidden !important;
    }
    li {
      list-style: none;
      transition: 1s all cubic-bezier(0.075, 0.82, 0.165, 1);
      &:hover {
        transform: scale(1.1);
      }
    }

    a {
      text-decoration: none;
      color: white;
    }
  }

  .category {
    background-color: transparent;
    border: none;
    font-size: 15pt;
    margin: 0;
    font-family: "Poppins";
    font-weight: bold;
    color: white;
    cursor: pointer;
    transition: all 0.5s ease-in-out;
  }

  .open {
    opacity: 0.5;
    &:hover {
      opacity: 0.7;
    }
  }
  footer {
    position: absolute;
    bottom: 5px;
    a {
      opacity: 0.6;
      transition: opacity 0.3s;
      padding: 0 10px;
      &:hover {
        opacity: 0.8;
      }
      // &::before {
      //   content: "  |  ";
      // }

      &:first-child {
        &::before {
          content: "";
        }
      }
    }
  }
</style>
