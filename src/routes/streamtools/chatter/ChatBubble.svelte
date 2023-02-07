<script lang="ts">
  import { onMount } from "svelte";
  import { fade } from "svelte/transition";
  import type { ChatterParameters } from "./paramsChatter";
  export let params: ChatterParameters, message: Message, badgeData: BadgeData;
  let bubble: HTMLElement;
  let badges: Array<string> = [];
  let bigEmote = true;

  let vip = false;
  let mod = false;
  let first = false;
  let bits = false;

  let fullShadow = `1px 1px var(--shadowCol), 2px 2px var(--shadowCol), 3px 3px var(--shadowCol), 4px 4px var(--shadowCol), 5px 5px var(--shadowCol), 6px 6px var(--shadowCol), 7px 7px var(--shadowCol)`;

  //PARSING
  function runBadge() {
    if (!message.tags.badges) return;
    Object.keys(message.tags.badges).forEach((k) => {
      if (badgeData[k]) {
        let variations = badgeData[k].versions;
        if (Object.keys(variations).length === 1) {
          badges.push(variations[Object.keys(variations)[0]]["image_url_4x"]);
        } else if (variations[message.tags.badges[k]]) {
          badges.push(variations[message.tags.badges[k]]["image_url_4x"]);
        }
      }
    });
  }
  if (params.badges) runBadge();

  //ANIMATIONS
  function PopIn(el: HTMLElement, size: DOMRect) {
    el.style.margin = `0px var(--marginX) 0px var(--marginX)`;
    el.style.padding = `0px var(--paddingX) 0px var(--paddingX)`;
    el.style.visibility = "hidden";
    el.style.maxHeight = "0";
    setTimeout(() => {
      el.style.transition = "all var(--animTime) var(--animEase)";
      el.style.visibility = "visible";
      el.style.padding = `var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX)`;
      el.style.margin = `var(--marginY) var(--marginX) var(--marginY) var(--marginX)`;
      el.style.opacity = "1";
      el.style.maxHeight = `${size.height + 30}px`;
      if (params.highlight) {
        el.style.transform = `translateX(-8px) translateY(-8px)`;
        el.style.boxShadow = fullShadow;
      }
    }, 100);
  }

  function slideInBoth(el: HTMLElement) {
    el.style.opacity = "1";
    setTimeout(() => {
      el.style.transition = "all var(--animTime) var(--animEase)";
      if (params.highlight) {
        el.style.transform = `translateX(-8px) translateY(-8px)`;
      } else {
        el.style.transform = `translateX(-8px)`;
      }
    }, 100);
  }

  function SlideInLeft(el: HTMLElement, size: DOMRect) {
    if (params.align === "center") size.width = size.width * 2.5;
    let negative = "* -1";
    if (params.align === "flex-end") negative = " * 1.2";
    el.style.transform = `translateX(calc( (${size.width}px + var(--paddingX) + var(--marginX)) ${negative}))`;
    if (params.highlight) {
      el.style.transform = `translateX(calc( (${size.width}px + var(--paddingX) + var(--marginX)) ${negative})) translateY(-8px)`;
      el.style.boxShadow = fullShadow;
    }
    slideInBoth(el);
  }

  function SlideInRight(el: HTMLElement, size: DOMRect) {
    el.style.transform = `translateX(calc( (${size.width}px + var(--paddingX) + var(--marginX))))`;
    if (params.highlight) {
      el.style.transform = `translateX(calc( (${size.width}px + var(--paddingX) + var(--marginX)))) translateY(-8px)`;
      el.style.boxShadow = fullShadow;
    }
    slideInBoth(el);
  }

  function FadeIn(el: HTMLElement) {
    el.style.opacity = "0";
    if (params.highlight) {
      el.style.transform = `translateX(-8px) translateY(-8px)`;
      el.style.boxShadow = fullShadow;
    }
    setTimeout(() => {
      el.style.transition = "all var(--animTime) var(--animEase)";
      el.style.opacity = "1";
    }, 100);
  }

  function Grow(el: HTMLElement, size: DOMRect) {
    el.style.margin = `0px var(--marginX) 0px var(--marginX)`;
    el.style.padding = `0px var(--paddingX) 0px var(--paddingX)`;
    el.style.transform = `scale(0)`;
    el.style.maxHeight = "0";
    if (params.highlight) {
      el.style.boxShadow = fullShadow;
      el.style.transform = `translateX(-8px) translateY(-8px) scale(0)`;
    }
    setTimeout(() => {
      el.style.transition = "all var(--animTime) var(--animEase)";
      el.style.padding = `var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX)`;
      el.style.margin = `var(--marginY) var(--marginX) var(--marginY) var(--marginX)`;
      el.style.maxHeight = `${size.height + 30}px`;
      el.style.transform = `scale(1)`;
      el.style.opacity = "1";
      if (params.highlight) {
        el.style.transform = `translateX(-8px) translateY(-8px) scale(1)`;
      }
    }, 100);
  }

  //MOUNTED
  onMount(async () => {
    console.log(message);
    let size = bubble.getBoundingClientRect();
    if (!params.animEase) params.animEase = "ease-in-out";
    params.animation = params.animation.replace(" ", "");
    if (params.animation === "SlideIn") params.animation = "SlideInLeft";

    let userCol = `rgba(${parseInt(message.color.slice(-6, -4), 16)}, ${parseInt(message.color.slice(-4, -2), 16)}, ${parseInt(message.color.slice(-2), 16)}, ${params.chatopacity / 100})`;
    let userColAlpha = `rgb(${parseInt(message.color.slice(-6, -4), 16)}, ${parseInt(message.color.slice(-4, -2), 16)}, ${parseInt(message.color.slice(-2), 16)})`;

    bubble.style.setProperty("--animTime", `${params.animTime}s`);
    bubble.style.setProperty("--animEase", params.animEase);
    bubble.style.setProperty("--userCol", params.bubbleCustom ? userCol : params.chatcolourCalc);
    bubble.style.setProperty("--shadowCol", params.togglecol ? userColAlpha : params.highcolour);

    if (params.animation === "PopIn") PopIn(bubble, size);
    if (params.animation === "SlideInLeft") SlideInLeft(bubble, size);
    if (params.animation === "SlideInRight") SlideInRight(bubble, size);
    if (params.animation === "FadeIn") FadeIn(bubble);
    if (params.animation === "Grow") Grow(bubble, size);

    if (message.tags.badges.vip) vip = true;
    if (message.tags.mod) mod = true;
    if (message.tags["first-msg"]) first = true;
    if (message.tags.bits) bits = true;

    console.log(params, message);

    if (params.emoteOnly) {
      message.message.forEach((el) => {
        if (typeof el === "string") bigEmote = false;
      });
    } else {
      bigEmote = false;
    }
  });
</script>

<div class="chatBubble {message.type} {message.tags.username} {message.tags['custom-reward-id'] || ''}" class:first class:bits class:mod class:vip style="font-family: {params.font}; border-radius: {params.border / 10}rem;" bind:this={bubble} out:fade>
  <p>
    <span style="color: {params.fontcolour}">
      {#if params.badges}
        {#each badges as badge}
          <img src={badge} alt="badge" class="twitchBadge" />
        {/each}
      {/if}
      {#if params.pronouns && message.pronoun}
        <span class="pronoun" style="font-family:{params.proFont}; --proColour:{params.proUseCol ? message.tags.color : params.proColour}; border-width: {params.proOutline ? '2px' : '0px'}; background-color: {params.proBG ? 'var(--proColour)' : ''}; color: {params.proBG ? params.proColour : 'var(--proColour)'}">{message.pronoun}</span>
      {/if}
      <b class="chatName" style="color: {params.nameCustom ? message.tags.color : 'inherit'}">{message.tags["display-name"]}{": "}</b>
      {#each message.message as word}
        {#if word.code}
          <img src={word.code} alt={word.text} class={bigEmote ? "bigEmote" : "emote"} />
          {#if word.num}
            <i>{" "}{word.num}{" "}</i>
          {/if}
        {:else}
          {word.text}{" "}
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
  --animName: fadeIn;
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
  padding: 0 0.3rem;
  //font-size: 0.8rem;
  border-style: solid;
  display: inline !important;
  width: fit-content;
  color: var(--proColour);
  border-color: var(--proColour);
}

@keyframes fadeIn {
  from {opacity: 0;}
  to {opacity: 100%;}
}
</style>
