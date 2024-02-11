<script lang="ts">
  import { storage } from "../../../gameParams";
  import tooltip from "../../../../js/tooltip";
</script>

<section class={$storage.twordle.settings.dark ? "twordleDark" : "twordleLight"}>
  <h2>How to play</h2>
  <p>
    Twordle is a word game to play with Twitch chat. <br /><br />
    The streamer enters a secret word, or selects a random word. Each round the chat must guess one letter at a time what the word is. <br /><br />
    Any single letters written in chat (upper or lower case) count as a vote for the current round. The letter with the most votes goes on the grid. <br /><br />
    Each row, once complete, will reveal how close that guess is to the secret word.<br />
    <br />
    For example:
  </p>
  <div id="boxbox">
    <span use:tooltip={"Wrong"}>X</span>
    <span use:tooltip={"In Word"}>O</span>
    <span use:tooltip={"Correct"}>✓</span>
  </div>
  <p>
    It's advised that chat <i>try</i> to write <i>actual</i> words. <br />
  </p>
  <footer>Made by <a aria-label="Twitch Account" href="https://www.twitch.tv/colloquialowl">ColloquialOwl</a>, Inspired by <a href="https://www.powerlanguage.co.uk/wordle/">Wordle</a>.</footer>
</section>

<style lang="scss">
  @use "../../../../css/colours.scss" as *;

  section {
    text-align: left;
    color: white;
    font-size: 16px;
    h2 {
      text-align: center;
      text-decoration: underline;
      text-decoration-color: $twordlePurple;
      text-decoration-thickness: 3px;
      margin-top: 0.1rem;
      &::selection {
        background-color: $twordlePurple;
        color: $white;
        text-shadow: none;
      }
    }
  }
  div {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  span {
    width: 3rem !important;
    height: 3rem !important;
    margin: 0.7rem;
  }
  footer {
    text-align: center;
    font-size: 0.8rem;
    padding: 0.2rem;
    margin: 0.3rem 0;
    margin-bottom: 1rem;
    border-radius: 0.3rem;
    background-color: $twordlePurple;
    font-style: italic;
    a {
      color: $white;
      //text-decoration: none;
    }
  }
  #boxbox {
    width: 100%;
    display: flex;
    flex-direction: row;
    color: white;
    font-size: 2.5rem;
    font-weight: bold;
    user-select: none;
    span {
      display: flex;
      text-align: center;
      align-items: center;
      justify-content: center;
      border: 4px $twordleMain solid;
    }
    :nth-child(1) {
      background-color: var(--mainDarken10);
      opacity: 0.6;
    }
    :nth-child(2) {
      background-color: $twordleOrange;
    }
    :nth-child(3) {
      background-color: $twordleGreen;
    }
  }
</style>
