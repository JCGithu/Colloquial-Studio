<script>
  import { onMount } from "svelte";
  export let params, message, badgeData, userPronouns;
  let bubble, animHeight, size, pronoun;
  let badges = [];
  let bigEmote = true;

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
  function PopIn(el, size) {
    el.style.margin = `0px var(--marginX) 0px var(--marginX)`;
    el.style.padding = `0px var(--paddingX) 0px var(--paddingX)`;
    el.style.visibility = "hidden";
    el.style.maxHeight = 0;
    setTimeout(() => {
      el.style.transition = "all var(--animTime) var(--animEase)";
      el.style.visibility = "visible";
      el.style.padding = `var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX)`;
      el.style.margin = `var(--marginY) var(--marginX) var(--marginY) var(--marginX)`;
      el.style.opacity = 1;
      el.style.maxHeight = `${size.height + 30}px`;
      if (params.highlight) {
        el.style.transform = `translateX(-8px) translateY(-8px)`;
        el.style.boxShadow = `1px 1px, 2px 2px, 3px 3px, 4px 4px, 5px 5px, 6px 6px, 7px 7px`;
      }
    }, 100);
  }

  function SlideInLeft(el, size) {
    if (params.align === "center") size.width = size.width * 2.5;
    let negative = "* -1";
    if (params.align === "flex-end") negative = " * 1.2";
    el.style.transform = `translateX(calc( (${size.width}px + var(--paddingX) + var(--marginX)) ${negative}))`;
    if (params.highlight) {
      el.style.transform = `translateX(calc( (${size.width}px + var(--paddingX) + var(--marginX)) ${negative})) translateY(-8px)`;
      el.style.boxShadow = `1px 1px, 2px 2px, 3px 3px, 4px 4px, 5px 5px, 6px 6px, 7px 7px`;
    }
    el.style.opacity = 1;
    setTimeout(() => {
      el.style.transition = "all var(--animTime) var(--animEase)";
      if (params.highlight) {
        el.style.transform = `translateX(-8px) translateY(-8px)`;
      } else {
        el.style.transform = `translateX(-8px)`;
      }
    }, 100);
  }

  function SlideInRight(el, size) {
    el.style.transform = `translateX(calc( (${size.width}px + var(--paddingX) + var(--marginX))))`;
    if (params.highlight) {
      el.style.transform = `translateX(calc( (${size.width}px + var(--paddingX) + var(--marginX)))) translateY(-8px)`;
      el.style.boxShadow = `1px 1px, 2px 2px, 3px 3px, 4px 4px, 5px 5px, 6px 6px, 7px 7px`;
    }
    el.style.opacity = 1;
    setTimeout(() => {
      el.style.transition = "all var(--animTime) var(--animEase)";
      if (params.highlight) {
        el.style.transform = `translateX(-8px) translateY(-8px)`;
      } else {
        el.style.transform = `translateX(-8px)`;
      }
    }, 100);
  }

  function FadeIn(el) {
    el.style.opacity = 0;
    if (params.highlight) {
      el.style.transform = `translateX(-8px) translateY(-8px)`;
      el.style.boxShadow = `1px 1px, 2px 2px, 3px 3px, 4px 4px, 5px 5px, 6px 6px, 7px 7px`;
    }
    setTimeout(() => {
      el.style.transition = "all var(--animTime) var(--animEase)";
      el.style.opacity = 1;
    }, 100);
  }

  function Grow(el, size) {
    el.style.margin = `0px var(--marginX) 0px var(--marginX)`;
    el.style.padding = `0px var(--paddingX) 0px var(--paddingX)`;
    el.style.transform = `scale(0)`;
    el.style.maxHeight = 0;
    if (params.highlight) {
      el.style.boxShadow = `1px 1px, 2px 2px, 3px 3px, 4px 4px, 5px 5px, 6px 6px, 7px 7px`;
      el.style.transform = `translateX(-8px) translateY(-8px) scale(0)`;
    }
    setTimeout(() => {
      el.style.transition = "all var(--animTime) var(--animEase)";
      el.style.padding = `var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX)`;
      el.style.margin = `var(--marginY) var(--marginX) var(--marginY) var(--marginX)`;
      el.style.maxHeight = `${size.height + 30}px`;
      el.style.transform = `scale(1)`;
      el.style.opacity = 1;
      if (params.highlight) {
        el.style.transform = `translateX(-8px) translateY(-8px) scale(1)`;
      }
    }, 100);
  }

  //MOUNTED
  onMount(async () => {
    let size = bubble.getBoundingClientRect();
    if (!params.animEase) params.animEase = "ease-in-out";
    params.animation = params.animation.replace(" ", "");
    if (params.animation === "SlideIn") params.animation = "SlideInLeft";

    let userCol = params.chatcolourCalc;
    if (params.bubbleCustom) {
      userCol = `rgba(${parseInt(message.color.slice(-6, -4), 16)},${parseInt(message.color.slice(-4, -2), 16)},${parseInt(message.color.slice(-2), 16)},${params.chatopacity / 100})`;
    }

    bubble.style.setProperty("--animTime", `${params.animTime}s`);
    bubble.style.setProperty("--animEase", params.animEase);
    bubble.style.setProperty("--userCol", userCol);

    if (params.animation === "PopIn") PopIn(bubble, size);
    if (params.animation === "SlideInLeft") SlideInLeft(bubble, size);
    if (params.animation === "SlideInRight") SlideInRight(bubble, size);
    if (params.animation === "FadeIn") FadeIn(bubble);
    if (params.animation === "Grow") Grow(bubble, size);

    if (params.pronouns && message.user) {
      let LC = message.user.toLowerCase();
      pronoun = userPronouns.get(LC);
      if (pronoun === "" || !pronoun) pronoun = false;
    }
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

<div class="chatBubble {message.type} {message.tags.bits ? 'bitMessage' : ''} " style="font-family: {params.font}; background-color: var(--userCol); border-radius: {params.border / 10}rem;" bind:this={bubble}>
  <p>
    <span style="color: {params.fontcolour}">
      {#if params.badges}
        {#each badges as badge}
          <img src={badge} alt="badge" class="twitchBadge" />
        {/each}
      {/if}
      {#if params.pronouns && pronoun}
        <span class="pronoun" style="font-family:{params.proFont}; --proColour:{params.proUseCol ? message.tags.color : params.proColour}; border-width: {params.proOutline ? '2px' : '0px'}; background-color: {params.proBG ? 'var(--proColour)' : ''}; color: {params.proBG ? params.proColour : 'var(--proColour)'}">{pronoun}</span>
      {/if}
      <b class="chatName" style="color: {params.nameCustom ? message.tags.color : 'inherit'}">{message.tags["display-name"]}{": "}</b>
      {#each message.message as word}
        {#if typeof word == "string"}
          {word}{" "}
        {:else if word.num}
          <img src={word.code} alt={word.text} class={bigEmote ? "bigEmote" : "emote"} />
          <i>{" "}{word.num}{" "}</i>
        {:else}
          <img src={word.code} alt={word.text} class={bigEmote ? "bigEmote" : "emote"} />
        {/if}
      {/each}
    </span>
  </p>
  <div class="animAdd" />
</div>

<style lang="scss">
  @import "../../../css/chatter.scss";
</style>
