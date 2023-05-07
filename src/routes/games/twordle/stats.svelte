<script lang="ts">
  import "../../../css/default.scss";
  import { storage } from "./twFunctions";
</script>

<div class={$storage.dark ? "twordleDark" : "twordleLight"}>
  <div class="statStack">
    <div>
      <h4>Total Votes</h4>
      {$storage.votes}
    </div>
    <div>
      <h4>Games Played</h4>
      {$storage.play}
    </div>
    <div>
      <h4>Games Won</h4>
      {$storage.won}
    </div>
  </div>
</div>

<style lang="scss">
  @use "../../../css/colours.scss" as *;
  .statStack {
    display: flex;
    flex-direction: column;
    width: 100%;
    div {
      border-color: var(--mainDarken20);
      border-width: 3px;
      background-color: var(--mainDarken10);
      border-style: solid;
      border-radius: 1rem;
      padding: 0.25rem;
      margin: 0.25rem;
    }
  }
  h4 {
    margin: 0;
    color: var(--text);
  }
</style>
