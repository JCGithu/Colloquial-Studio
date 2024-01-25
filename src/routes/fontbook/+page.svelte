<script lang="ts">
  let list: ParsedFont[] = [];
  let localFontPermission = false;
  let textInput = "";

  import { onMount } from "svelte";
  onMount(async () => {
    let localFonts;
    if (window.queryLocalFonts) {
      console.log("WOW");
      localFontPermission = true;
      localFonts = await window.queryLocalFonts();
    } else if (navigator.fonts?.query) {
      localFonts = await navigator.fonts.query({
        persistentAccess: true,
      });
    }
    if (localFonts) {
      console.log(localFonts);
      localFonts.forEach((font: FontData) => {
        let styleMatch = font.style.match(/semibold|demibold|bold|semilight|extralight|light/i);
        if (styleMatch) {
          console.log(styleMatch[0]);
          styleMatch[0] = styleMatch[0].replace(/extralight/i, "200");
          styleMatch[0] = styleMatch[0].replace(/semilight/i, "350");
          styleMatch[0] = styleMatch[0].replace(/light/i, "300");
          styleMatch[0] = styleMatch[0].replace(/semibold|demibold/i, "600");
          styleMatch[0] = styleMatch[0].replace(/bold/i, "600");
        }

        let styleName = font.fullName.replace(/ extralight | semilight | light | semibold | bold /i, " ");
        styleName = styleName.replace(/ extralight| semilight| light| semibold| bold| italic/i, "");
        let fontInfo = {
          name: font.fullName,
          style: `
            ${/italic|Italic|slanted|Slanted/.test(font.fullName) ? "font-style:italic;" : ""}
            font-weight: ${styleMatch ? styleMatch[0] : ""};
            font-family: "${styleName}", "${font.fullName}", "${font.postscriptName}", "${font.family}";`,
        };
        list.push(fontInfo);
      });
      list = list;
    }
  });
</script>

<svelte:head>
  <title>FontBook</title>
  <style>
    body {
      width: 100vw;
      width: 100vdw;
      height: 100vh;
      height: 100vdh;
      overflow: hidden;
      background-color: hsl(60, 1%, 14%);
    }
  </style>
</svelte:head>

<section>
  <header>
    <h1>FontBook</h1>
    <p>An easy way to browse the fonts installed on your computer</p>
    {#if !localFontPermission}
      <h3>This site currently doesn't have permission to see local fonts</h3>
    {/if}
    <input placeholder="See text in action" bind:value={textInput} />
  </header>
  <div id="fontGrid">
    {#if list.length === 0}
      <p>Loading fonts...</p>
    {:else}
      {#each list as font}
        <span style={font.style}>{textInput.length ? textInput : font.name}</span>
      {/each}
    {/if}
  </div>
</section>

<style lang="scss">
  @use "../../css/colours.scss" as *;
  @import "../../css/default.scss";

  section {
    display: flex;
    flex-direction: column;
    background-color: $black;
    color: $white;
    height: 100vh;
    height: 100dvh;
    grid-template-rows: repeat(3, 1fr);
  }
  header {
    text-align: center;
    font-family: "Verre";
    h1 {
      font-weight: bold;
      font-size: 3.5rem;
      margin: 0.5rem;
      margin-top: 2rem;
    }
  }
  p {
    font-family: "Verre";
  }
  #fontGrid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1rem;
    padding: 2rem 2rem;
    margin: 2rem;
    overflow-y: scroll;
    &::-webkit-scrollbar {
      visibility: hidden;
      width: 0;
    }
    span {
      background-color: rgba(black, 0.2);
      border-radius: 1rem;
      font-size: 1.5rem;
      text-align: center;
      padding: 1rem;
      display: flex;
      vertical-align: middle;
      align-items: center;
      justify-content: center;
    }
  }
</style>
