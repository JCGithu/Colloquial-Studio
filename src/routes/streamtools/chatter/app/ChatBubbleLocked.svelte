<script lang="ts">
  import { onMount } from "svelte";

  export let inProgress: ChatterParameters;
  export let message: Message, badgeData: BadgeData;

  let badges: Array<string> = [];

  //PARSING BADGES
  if (inProgress.badges && message.tags.badges) {
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
  let chatBackgroundCalc = `rgba(${parseInt(inProgress.chatcolour.slice(-6, -4), 16)},${parseInt(inProgress.chatcolour.slice(-4, -2), 16)},${parseInt(inProgress.chatcolour.slice(-2), 16)},${inProgress.chatopacity / 100})`;
  let userCol = `rgba(${parseInt(message.color.slice(-6, -4), 16)}, ${parseInt(message.color.slice(-4, -2), 16)}, ${parseInt(message.color.slice(-2), 16)}, ${inProgress.chatopacity / 100})`;
  let userColAlpha = `rgb(${parseInt(message.color.slice(-6, -4), 16)}, ${parseInt(message.color.slice(-4, -2), 16)}, ${parseInt(message.color.slice(-2), 16)})`;

  let bigEmote = inProgress.emoteOnly;
  if (bigEmote) {
    message.message.forEach((el) => {
      if (!el.code) bigEmote = false;
    });
  }
  let box: HTMLElement;
  let animHeight = "0px";
  onMount(() => {
    if (inProgress.animation === "Pop In") {
      let target = box.getBoundingClientRect().height;
      animHeight = `${target + 24}px`;
      box.style.maxHeight = "0px";
    }
  });
</script>

<div
  bind:this={box}
  class="chatBubble {message.type} {inProgress.animation.replace(' ', '_')} {inProgress.align} {message.tags.username} {message.tags['msg-id'] || ''} {message.tags['custom-reward-id'] || ''}"
  class:dropShadow={inProgress.highlight}
  class:bubbleBanner={inProgress.banner}
  class:first={message.tags["first-msg"] || message.type === "first"}
  class:bits={message.tags.bits}
  class:mod={message.tags.mod}
  class:vip={message.tags.badges?.vip}
  style="font-family: {inProgress.font}; border-radius: {inProgress.border / 100}rem;"
  style:--animTime={`${inProgress.animTime}s`}
  style:--animEase={inProgress.animEase}
  style:--userCol={inProgress.bubbleCustom ? userCol : chatBackgroundCalc}
  style:--shadowCol={inProgress.togglecol ? userColAlpha : inProgress.highcolour}
  style:--animHeight={animHeight}
>
  <div class="chatContent">
    <span style="color: {inProgress.fontcolour};">
      {#if inProgress.badges}
        {#each badges as badge}
          <img src={badge} alt="badge" class="twitchBadge" />
        {/each}
      {/if}
      <b class="chatName" style="color: {inProgress.nameCustom ? message.tags.color : 'inherit'}">{message.tags["display-name"]}</b>
      {#if inProgress.pronouns && message.pronoun}
        <span class="pronoun" class:proOut={inProgress.proOutline > 1} class:customOut={inProgress.proOutline > 2} class:proBG={inProgress.proBG > 1} class:customBG={inProgress.proBG > 2} class:customText={!inProgress.proUseCol} style="font-family:{inProgress.proFont}; --userColour:{message.tags.color}; --customText:{inProgress.proColour}; --customBG: {inProgress.proBGColour}; --customOutline:{inProgress.proOutColour}">{message.pronoun}</span>
      {/if}
      <span class="divider"></span>
      {#each message.message as word, i}
        {#if word.code}
          <img src={word.code} alt={word.text} class="emote" class:bigEmote class:wideEmote={inProgress.wideEmotes && i > 0 && message.message[i - 1].text === "w!"} />
          {#if word.num}
            <i>{" "}{word.num}{" "}</i>
          {/if}
        {:else if word.text != "w!"}
          <span class="word">
            {#if inProgress.splitLetters}
              {#each word.text as letter}
                <span class="letter">{letter}</span>
              {/each}
            {:else}
              {word.text}
            {/if}
          </span>
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
    --animHeight: 24px;
    background-color: var(--userCol);
    color: var(--userCol);
    position: relative;
    display: grid;
    grid-template-rows: 1fr;
    transition: grid-template-rows var(--animTime) var(--animEase);
    flex-direction: row;
    flex-wrap: nowrap;
    transform-origin: bottom center;
    justify-self: end;
    width: max-content;
    max-width: calc(100% - 25px - 20px - 0.5rem);
    font-weight: normal;
    font-weight: 500;
    overflow-wrap: break-word;
    z-index: 1;
    animation-delay: 1ms;
    b {
      white-space: pre;
    }

    span {
      align-items: center;
    }
    .twitchBadge:first-of-type {
      margin-left: -0.2rem;
    }
  }

  .chatContent {
    overflow: hidden;
    display: block;
    margin: 0;
  }
  @keyframes bubblePad {
    from {
      padding: 0 calc(var(--fontSize) * 0.1);
    }
    to {
      padding: calc(var(--fontSize) * 0.1);
    }
  }

  span,
  b {
    vertical-align: text-top;
  }

  .dropShadow {
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
  .Pop_In,
  .Grow {
    padding: 0 var(--paddingX) 0 var(--paddingX);
    margin: 0 var(--marginX) 0 var(--marginX);
    .chatContent {
      animation: bubblePad var(--animTime) var(--animEase) forwards;
    }
  }
  @keyframes PopInAnimation {
    0% {
      padding: 0 var(--paddingX) 0 var(--paddingX) !important;
      margin: 0 var(--marginX) 0 var(--marginX) !important;
      max-height: 0;
    }
    100% {
      padding: var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX);
      margin: var(--marginY) var(--marginX) var(--marginY) var(--marginX);
      max-height: var(--animHeight);
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
    0% {
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }
  .Grow {
    --transformAmount: scale(1);
    animation: GrowAnimation var(--animTime) var(--animEase) forwards;
  }
  @keyframes GrowAnimation {
    0% {
      padding: 0 var(--paddingX) 0 var(--paddingX) !important;
      margin: 0 var(--marginX) 0 var(--marginX) !important;
      transform: scale(0);
      font-size: 1px;
    }
    100% {
      padding: var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX);
      margin: var(--marginY) var(--marginX) var(--marginY) var(--marginX);
      transform: var(--transformAmount);
    }
  }
  .Slide_Left {
    --transformAmount: translateX(-100%);
  }
  .Slide_Right {
    --transformAmount: translateX(100%);
  }
  .Slide_Left,
  .Slide_Right,
  .Fade_In {
    padding: var(--paddingY) var(--paddingX) var(--paddingY) var(--paddingX);
    margin: var(--marginY) var(--marginX) var(--marginY) var(--marginX);
    animation: singleAnimation var(--animTime) var(--animEase) forwards;
  }

  @keyframes singleAnimation {
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

  //Pronouns
  .pronoun {
    --proColour: #ffffff;
    border-radius: 2rem;
    width: fit-content;
    vertical-align: baseline;
    color: var(--userColour);
    font-weight: bold;
    transform: translateY(-1px) !important;
    display: inline-block !important;
    font-size: calc(var(--fontSize) * 0.8);
  }
  .proOut {
    padding: 0 0.3rem;
    align-self: start !important;
    justify-self: baseline !important;
    border-width: 2px;
    border-width: calc(var(--fontSize) * 0.15);
    border-style: solid;
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
  .divider:before {
    content: ": ";
  }
</style>
