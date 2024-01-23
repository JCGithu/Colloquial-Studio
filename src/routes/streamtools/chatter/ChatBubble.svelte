<script lang="ts">
  import { fade } from "svelte/transition";
  import { storage } from "../../toolParams";
  import { onMount } from "svelte";
  export let message: Message, badgeData: BadgeData;

  let badges: Array<string> = [];
  let bigEmote = true;

  //PARSING BADGES
  if ($storage.chatter.inProgress.badges && message.tags.badges) {
    Object.keys(message.tags.badges).forEach((k) => {
      if (!badgeData[k]) return;
      let variations = badgeData[k].versions;
      if (Object.keys(variations).length === 1) {
        badges.push(variations[Object.keys(variations)[0]]["image_url_2x"]);
      } else if (variations[message.tags.badges[k]]) {
        badges.push(variations[message.tags.badges[k]]["image_url_2x"]);
      }
    });
  }

  //ANIMATIONS
  let userCol = `rgba(${parseInt(message.color.slice(-6, -4), 16)}, ${parseInt(message.color.slice(-4, -2), 16)}, ${parseInt(message.color.slice(-2), 16)}, ${$storage.chatter.inProgress.chatopacity / 100})`;
  let userColAlpha = `rgb(${parseInt(message.color.slice(-6, -4), 16)}, ${parseInt(message.color.slice(-4, -2), 16)}, ${parseInt(message.color.slice(-2), 16)})`;

  if ($storage.chatter.inProgress.emoteOnly) {
    message.message.forEach((el) => {
      if (!el.code) bigEmote = false;
    });
  } else {
    bigEmote = false;
  }
</script>

<div
  class="chatBubble {message.type} {$storage.chatter.inProgress.animation.replace(' ', '_')} {$storage.chatter.inProgress.align} {message.tags.username} {message.tags['msg-id'] || ''} {message.tags['custom-reward-id'] || ''}"
  class:dropShadow={$storage.chatter.inProgress.highlight}
  class:bubbleBanner={$storage.chatter.inProgress.banner}
  class:first={message.tags["first-msg"]}
  class:bits={message.tags.bits}
  class:mod={message.tags.mod}
  class:vip={message.tags.badges?.vip}
  style="font-family: {$storage.chatter.inProgress.font}; border-radius: {$storage.chatter.inProgress.border / 100}rem;"
  style:--animTime={`${$storage.chatter.inProgress.animTime}s`}
  style:--animTimeSlow={`${$storage.chatter.inProgress.animTime * 1}s`}
  style:--animEase={$storage.chatter.inProgress.animEase}
  style:--userCol={$storage.chatter.inProgress.bubbleCustom ? userCol : $storage.chatter.inProgress.chatcolourCalc}
  style:--shadowCol={$storage.chatter.inProgress.togglecol ? userColAlpha : $storage.chatter.inProgress.highcolour}
  out:fade
>
  <div class="bubbleContent">
    <span style="color: {$storage.chatter.inProgress.fontcolour};">
      {#if $storage.chatter.inProgress.badges}
        {#each badges as badge}
          <img src={badge} alt="badge" class="twitchBadge" />
        {/each}
      {/if}
      <b class="chatName" style="color: {$storage.chatter.inProgress.nameCustom ? message.tags.color : 'inherit'}">{message.tags["display-name"]}</b>
      {#if $storage.chatter.inProgress.pronouns && message.pronoun}
        <span
          class="pronoun"
          class:proOut={$storage.chatter.inProgress.proOutline > 1}
          class:customOut={$storage.chatter.inProgress.proOutline > 2}
          class:proBG={$storage.chatter.inProgress.proBG > 1}
          class:customBG={$storage.chatter.inProgress.proBG > 2}
          class:customText={!$storage.chatter.inProgress.proUseCol}
          style="font-family:{$storage.chatter.inProgress.proFont}; --userColour:{message.tags.color}; --customText:{$storage.chatter.inProgress.proColour}; --customBG: {$storage.chatter.inProgress.proBGColour}; --customOutline:{$storage.chatter.inProgress.proOutColour}">{message.pronoun}</span
        >
      {/if}
      {": "}
      {#each message.message as word, i}
        {#if word.code}
          <img src={word.code} alt={word.text} class="emote" class:bigEmote class:wideEmote={$storage.chatter.inProgress.wideEmotes && i > 0 && message.message[i - 1].text === "w!"} />
          {#if word.num}
            <i>{" "}{word.num}{" "}</i>
          {/if}
        {:else if word.text != "w!"}
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
    <div class="animAdd" />
  </div>
</div>

<style lang="scss">
  .chatBubble {
    // DEFAULTS
    --marginY: 2.5px;
    --paddingY: 5px;
    --marginX: 10px;
    --paddingX: 15px;
    --animEase: ease-in-out;
    --animTime: 500ms;
    background-color: var(--userCol);
    color: var(--userCol);
    position: relative;
    display: grid;
    //display: block;
    grid-template-rows: 1fr;
    //transition: all var(--animTime) var(--animEase);
    transition: grid-template-rows var(--animTime) var(--animEase);
    flex-direction: row;
    flex-wrap: nowrap;
    justify-self: end;
    width: max-content;
    max-width: calc(100% - 25px - 20px - 0.5rem);
    border-radius: 0.5rem;
    font-weight: 500, normal;
    overflow-wrap: break-word;
    z-index: 1;
    padding: 0 var(--paddingX) 0 var(--paddingX);
    margin: 0 var(--marginX) 0 var(--marginX);

    b {
      white-space: pre;
    }

    .bubbleContent {
      overflow: hidden;
      display: block;
      padding: calc(var(--fontSize) * 0.1);
      margin: 0;
    }
    span {
      //display: contents;
      align-items: center;
    }
    .twitchBadge:first-of-type {
      margin-left: -0.2rem;
    }
  }

  span,
  b {
    vertical-align: text-top;
  }

  .dropShadow {
    //transform: translateX(-8px) translateY(-8px);
    box-shadow:
      1px 1px var(--shadowCol),
      2px 2px var(--shadowCol),
      3px 3px var(--shadowCol),
      4px 4px var(--shadowCol),
      5px 5px var(--shadowCol),
      6px 6px var(--shadowCol),
      7px 7px var(--shadowCol);
  }

  //Animations
  .Pop_In {
    animation: PopInAnimation var(--animTime) var(--animEase) forwards;
    &.bubbleBanner {
      animation: PopInBanner var(--animTime) var(--animEase) forwards;
    }
  }
  @keyframes PopInAnimation {
    0% {
      padding: 0 var(--paddingX) 0 var(--paddingX);
      margin: 0 var(--marginX) 0 var(--marginX);
      grid-template-rows: 0fr;
    }
    100% {
      grid-template-rows: 1fr;
      padding: var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX);
      margin: var(--marginY) var(--marginX) var(--marginY) var(--marginX);
    }
  }
  @keyframes PopInBanner {
    0% {
      grid-template-columns: 0fr;
      padding: 0 0 0 0;
      margin: 0 0 0 0;
    }
    100% {
      grid-template-columns: 1fr;
      padding: var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX);
      margin: var(--marginY) var(--marginX) var(--marginY) var(--marginX);
    }
  }
  .Fade_In {
    animation: FadeInAnimation var(--animTime) var(--animEase) forwards;
  }
  @keyframes FadeInAnimation {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  .Grow {
    --transformAmount: scale(1);
    animation: GrowAnimation var(--animTime) var(--animEase) forwards;
  }
  @keyframes GrowAnimation {
    0% {
      transform: scale(0);
      grid-template-rows: 0fr;
      font-size: 1px;
    }
    100% {
      transition: var(--transformAmount);
      grid-template-rows: 1fr;
      padding: var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX);
      margin: var(--marginY) var(--marginX) var(--marginY) var(--marginX);
    }
  }
  .Slide_Left,
  .Slide_Right,
  .Fade_In {
    padding: var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX);
    margin: var(--marginY) var(--marginX) var(--marginY) var(--marginX);
    animation: slideAnimation var(--animTime) var(--animEase) forwards;
  }
  .Slide_Left {
    --transformAmount: translateX(-100%);
  }
  .Slide_Right {
    --transformAmount: translateX(100%);
  }
  @keyframes slideAnimation {
    from {
      transform: var(--transformAmount);
    }
    to {
      transform: translateX(0);
    }
  }

  //Banner
  .bubbleBanner {
    display: flex;
    flex-direction: row;
    min-width: max-content;
    height: 2.25em;
    align-items: center;
    img {
      height: 1.1em !important;
    }
  }

  //Images etc
  .emote {
    height: 1.1em;
    padding-bottom: 0.2rem;
    vertical-align: middle;
  }

  .bigEmote {
    height: 2rem;
    margin: 0.2rem 0;
    vertical-align: middle;
  }

  .wideEmote {
    width: 4.4em;
    max-width: 75vw;
  }

  .wideEmote + .bigEmote {
    width: 8rem;
  }

  .twitchBadge {
    padding: 0.1rem;
    height: 1.1em;
    vertical-align: middle;
    padding-bottom: 0.2rem;
  }

  .pronoun {
    --proColour: #ffffff;
    border-radius: 2rem;
    width: fit-content;
    vertical-align: baseline;
    color: var(--userColour);
    font-weight: bold;
    display: inline !important;
    font-size: calc(var(--fontSize) * 0.8);
  }

  .proOut {
    padding: 0 0.3rem;
    align-self: start !important;
    justify-self: baseline !important;
    border-width: 2px;
    border-width: calc(var(--fontSize) * 0.15);
    border-style: solid;
    //margin-bottom: calc(var(--fontSize) * 1);
    border-color: var(--userColour);
  }
  .customText {
    color: var(--customText);
  }
  .customOut {
    border-color: var(--customOutline);
  }
  .proBG {
    padding: 0 0.3rem;
    background-color: var(--userColour);
  }
  .customBG {
    background-color: var(--customBG);
  }
</style>
