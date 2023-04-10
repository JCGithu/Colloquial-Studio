<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  //import type { ChatterParameters } from "./paramsChatter";
  import { storage } from "../params";
  export let message: Message, badgeData: BadgeData;

  let bubble: HTMLElement;
  let badges: Array<string> = [];
  let bigEmote = true;

  let vip = false;
  let mod = false;
  let first = false;
  let bits = false;

  //PARSING
  function runBadge() {
    if (!message.tags.badges) return;
    Object.keys(message.tags.badges).forEach((k) => {
      if (badgeData[k]) {
        let variations = badgeData[k].versions;
        if (Object.keys(variations).length === 1) {
          badges.push(variations[Object.keys(variations)[0]]["image_url_2x"]);
        } else if (variations[message.tags.badges[k]]) {
          badges.push(variations[message.tags.badges[k]]["image_url_2x"]);
        }
      }
    });
  }
  if ($storage.chatter.inProgress.badges) runBadge();

  //ANIMATIONS
  function PopIn(size: DOMRect) {
    bubble.style.margin = `0px var(--marginX) 0px var(--marginX)`;
    bubble.style.padding = `0px var(--paddingX) 0px var(--paddingX)`;
    bubble.style.visibility = "hidden";
    bubble.style.maxHeight = "0";
    requestAnimationFrame(() => {
      bubble.style.transition = "all var(--animTime) var(--animEase)";
      bubble.style.visibility = "visible";
      bubble.style.padding = `var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX)`;
      bubble.style.margin = `var(--marginY) var(--marginX) var(--marginY) var(--marginX)`;
      bubble.style.opacity = "1";
      bubble.style.maxHeight = `${size.height + 30}px`;
      if ($storage.chatter.inProgress.highlight) {
        bubble.style.transform = `translateX(-8px) translateY(-8px)`;
      }
    });
  }

  function slideInBoth() {
    bubble.style.opacity = "1";
    requestAnimationFrame(() => {
      bubble.style.transition = "all var(--animTime) var(--animEase)";
      bubble.style.transform = `${$storage.chatter.inProgress.highlight ? "translateX(-8px) translateY(-8px)" : ""}`;
    });
  }

  function SlideInLeft(size: DOMRect) {
    if ($storage.chatter.inProgress.align === "center") size.width = size.width * 2.5;
    let negative = "* -1";
    if ($storage.chatter.inProgress.align === "flex-end") negative = " * 1.2";
    bubble.style.transform = `translateX(calc( (${size.width}px + var(--paddingX) + var(--marginX)) ${negative}))`;
    if ($storage.chatter.inProgress.highlight) {
      bubble.style.transform = `translateX(calc( (${size.width}px + var(--paddingX) + var(--marginX)) ${negative})) translateY(-8px)`;
    }
    slideInBoth();
  }

  function SlideInRight(size: DOMRect) {
    bubble.style.transform = `translateX(calc( (${size.width}px + var(--paddingX) + var(--marginX)))) ${$storage.chatter.inProgress.highlight ? "translateY(-8px)" : ""}`;
    slideInBoth();
  }

  function FadeIn() {
    bubble.style.opacity = "0";
    if ($storage.chatter.inProgress.highlight) bubble.style.transform = `translateX(-8px) translateY(-8px)`;
    requestAnimationFrame(() => {
      bubble.style.transition = "all var(--animTime) var(--animEase)";
      bubble.style.opacity = "1";
    });
  }

  function Grow(size: DOMRect) {
    bubble.style.margin = `0px var(--marginX) 0px var(--marginX)`;
    bubble.style.padding = `0px var(--paddingX) 0px var(--paddingX)`;
    bubble.style.transform = `scale(0)`;
    bubble.style.maxHeight = "0";
    if ($storage.chatter.inProgress.highlight) {
      bubble.style.transform = `translateX(-8px) translateY(-8px) scale(0)`;
    }
    requestAnimationFrame(() => {
      bubble.style.transition = "all var(--animTime) var(--animEase)";
      bubble.style.padding = `var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX)`;
      bubble.style.margin = `var(--marginY) var(--marginX) var(--marginY) var(--marginX)`;
      bubble.style.maxHeight = `${size.height + 30}px`;
      bubble.style.transform = `scale(1)`;
      bubble.style.opacity = "1";
      if ($storage.chatter.inProgress.highlight) {
        bubble.style.transform = `translateX(-8px) translateY(-8px) scale(1)`;
      }
    });
  }

  function offScreen() {
    bubble.style.opacity = "1";
    bubble.style.transform = `translateX(0px) translateY(0px)`;
    if ($storage.chatter.inProgress.highlight) bubble.style.transform = `translateX(-8px) translateY(-8px)`;
  }

  //MOUNTED
  onMount(async () => {
    let size = bubble.getBoundingClientRect();
    if ($storage.chatter.inProgress.highlight) bubble.style.boxShadow = `1px 1px var(--shadowCol), 2px 2px var(--shadowCol), 3px 3px var(--shadowCol), 4px 4px var(--shadowCol), 5px 5px var(--shadowCol), 6px 6px var(--shadowCol), 7px 7px var(--shadowCol)`;
    if (!$storage.chatter.inProgress.animEase) $storage.chatter.inProgress.animEase = "ease-in-out";

    let userCol = `rgba(${parseInt(message.color.slice(-6, -4), 16)}, ${parseInt(message.color.slice(-4, -2), 16)}, ${parseInt(message.color.slice(-2), 16)}, ${$storage.chatter.inProgress.chatopacity / 100})`;
    let userColAlpha = `rgb(${parseInt(message.color.slice(-6, -4), 16)}, ${parseInt(message.color.slice(-4, -2), 16)}, ${parseInt(message.color.slice(-2), 16)})`;

    bubble.style.setProperty("--animTime", `${$storage.chatter.inProgress.animTime}s`);
    bubble.style.setProperty("--animEase", $storage.chatter.inProgress.animEase);
    bubble.style.setProperty("--userCol", $storage.chatter.inProgress.bubbleCustom ? userCol : $storage.chatter.inProgress.chatcolourCalc);
    bubble.style.setProperty("--shadowCol", $storage.chatter.inProgress.togglecol ? userColAlpha : $storage.chatter.inProgress.highcolour);

    if (!document.hidden) {
      if ($storage.chatter.inProgress.animation === "Pop In") PopIn(size);
      if ($storage.chatter.inProgress.animation === "Slide In") SlideInLeft(size);
      if ($storage.chatter.inProgress.animation === "Slide In" && $storage.chatter.inProgress.align === "flex-end") SlideInRight(size);
      if ($storage.chatter.inProgress.animation === "Fade In") FadeIn();
      if ($storage.chatter.inProgress.animation === "Grow") Grow(size);
    } else {
      offScreen();
    }

    if (message.tags.badges?.vip) vip = true;
    if (message.tags.mod) mod = true;
    if (message.tags["first-msg"]) first = true;
    if (message.tags.bits) bits = true;

    if ($storage.chatter.inProgress.emoteOnly) {
      message.message.forEach((el) => {
        if (!el.code) bigEmote = false;
      });
    } else {
      bigEmote = false;
    }
  });
</script>

<div class="chatBubble {message.type} {message.tags.username} {message.tags['custom-reward-id'] || ''}" class:first class:bits class:mod class:vip style="font-family: {$storage.chatter.inProgress.font}; border-radius: {$storage.chatter.inProgress.border / 100}rem;" bind:this={bubble} out:fade>
  <p>
    <span style="color: {$storage.chatter.inProgress.fontcolour}">
      {#if $storage.chatter.inProgress.badges}
        {#each badges as badge}
          <img src={badge} alt="badge" class="twitchBadge" />
        {/each}
      {/if}
      <b class="chatName" style="color: {$storage.chatter.inProgress.nameCustom ? message.tags.color : 'inherit'}">{message.tags["display-name"]}</b>
      {#if $storage.chatter.inProgress.pronouns && message.pronoun}
        <span class="pronoun" class:proOutline={$storage.chatter.inProgress.proOutline} class:proBG={$storage.chatter.inProgress.proBG} style="font-family:{$storage.chatter.inProgress.proFont}; --proColour:{$storage.chatter.inProgress.proUseCol ? message.tags.color : $storage.chatter.inProgress.proColour}; color: {$storage.chatter.inProgress.proBG ? $storage.chatter.inProgress.proColour : 'var(--proColour)'}">{message.pronoun}</span>
      {/if}
      {": "}
      {#each message.message as word}
        {#if word.code}
          <img src={word.code} alt={word.text} class="emote" class:bigEmote />
          {#if word.num}
            <i>{" "}{word.num}{" "}</i>
          {/if}
        {:else}
          <span class="word">
            {#if $storage.chatter.inProgress.splitLetters}
              {#each word.text as letter}
                <span class="letter">{letter}</span>
              {/each}
            {:else}
              {word.text}
            {/if}
          </span>
          <!-- {word.text}{" "} -->
        {/if}
      {/each}
    </span>
  </p>
  <div class="animAdd" />
</div>

<style lang="scss">
.chatBubble{
  --fontCol: #fff;
  --userCol: #2fa578;
  --bubbleCol: #2fa578;

  --marginY: 2.5px;
  --paddingY: 5px;

  --marginX: 10px;
  --paddingX: 15px;

  position: relative;
  color: var(--fontCol);
  display: block;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-self: end;
  width: max-content;
  max-width: calc(100% - 25px - 20px - 0.5rem);
  border-radius: 0.5rem;
  font-weight: normal;
  opacity: 0;
  overflow-wrap: break-word;
  background-color: var(--userCol);
  color: var(--userCol);
  z-index: 1;
  padding: var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX);
  margin: var(--marginY) var(--marginX) var(--marginY) var(--marginX);
  --animTime: 0.5s 
  --animEase: ease-in;
  --animHeight: 35px;

  b{
    white-space: pre;
  }

  p {
    display: block;
    color: var(--fontCol);
    margin: 0;
  }
  span {
    display: contents;
    align-items: center;
  }
  .twitchBadge:first-of-type{
    margin-left: -0.2rem;
  }
}

.emote{
  height: 1.1em;
  padding-bottom: 0.2rem;
  vertical-align: middle;
}

.bigEmote{
  height: 2rem;
  margin: 0.2rem 0 ;
  vertical-align: middle;
}

.twitchBadge {
  padding: 0.1rem;
  height: 1.1em;
  vertical-align: middle;
  padding-bottom: 0.2rem;
}

.pronoun {
  --proColour: #ffffff;
  border-radius: 0.5rem;
  //font-size: 0.8rem;
  display: inline !important;
  width: fit-content;
  color: var(--proColour);
}

.proOutline{
  padding: 0 0.3rem;
  border-width: 2px;
  border-style: solid;
  border-color: var(--proColour);
}

.proBG{
  padding: 0 0.3rem;
  background-color: var(--proColour);
}

@keyframes fadeIn {
  from {opacity: 0;}
  to {opacity: 100%;}
}
</style>
