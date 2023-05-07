<script lang="ts">
  import { storage } from "./twFunctions";
</script>

<section class={$storage.dark ? "twordleDark" : "twordleLight"}>
  <p>
    Twordle is a word game to play with Twitch chat. <br /><br />
    The streamer enters a 5 letter secret word, or selects a random word. Each round chat must guess one letter at a time what the word is. <br /><br />
    When a round starts any single letters written in chat (upper or lower case) count as a vote. The letter with the most votes gets put on the grid. <br /><br />
    At the end of each row the blocks will colour in to reveal how close chat is to the secret word. Beige means the letter is not in the word, Orange means it is in the word, and green means that the letter is in the correct place. <br />
  </p>
  <div id="boxbox">
    <span>X</span>
    <span>O</span>
    <span>✓</span>
  </div>
  <p>
    It's advised that chat <i>try</i> to write <i>actual</i> words. <br />
    If you want to use this as a handsfree BRB screen, click 'auto mode'!
  </p>
</section>

<style lang="scss">
  @use "../../../css/colours.scss" as *;

  section {
    text-align: left !important;
    color: var(--text);
    font-size: 16px;
  }
  div {
    width: 100%;
    display: flex;
    justify-content: center;
  }
  span {
    width: 4rem !important;
    height: 4rem !important;
    margin: 1rem;
    background-color: red;
  }
  #boxbox {
    width: 100%;
    display: flex;
    flex-direction: row;
    color: white;
    font-size: 2.5rem;
    font-weight: bold;
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

  ::-webkit-scrollbar-track {
    background-clip: padding-box;
    border-radius: 100px;
    background-color: var(--mainDarken20);
    padding-right: 0.5rem;
    margin: 1rem;
    width: 10px;
    border: 8px solid rgba(0, 0, 0, 0);
    cursor: pointer !important;
  }

  ::-webkit-scrollbar {
    width: 25px;
    //background-color: var(--main);
    margin-right: 1rem;
    cursor: pointer !important;
  }

  ::-webkit-scrollbar-thumb {
    border-radius: 100px;
    border: 8px solid rgba(0, 0, 0, 0);
    //border-top: 8px red;
    background-color: var(--mainDarken10);
    background-clip: padding-box;
    cursor: pointer !important;
  }
</style>
