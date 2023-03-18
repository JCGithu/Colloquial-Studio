<script lang="ts">
  import "../../../css/default.scss";
  import { getContext, createEventDispatcher } from "svelte";
  import { storage } from "./twFunctions";
  const dispatch = createEventDispatcher();
  let styleString: string = getContext("colours");
</script>

<div class="innerMenu" style={styleString}>
  <h1>Stats</h1>
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
  <button
    on:click={() => {
      dispatch("close");
    }}>Close</button
  >
</div>

<style lang="scss">
  @import "../../../css/colours.scss";
  .innerMenu {
    font-family: "Poppins";
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 50%;
    background-color: var(--main);
    border-radius: 1rem;
    padding: 1rem;
    margin-top: 5rem;
    transition: 1s all ease-in-out;
    color: var(--text);
    z-index: 2;
    max-height: 90vh;
    @media only screen and (max-width: "800px") {
      width: 100%;
    }
  }
  h1 {
    margin: 0;
    color: var(--text);
  }
  p {
    margin: 0;
  }
  .statStack {
    display: flex;
    flex-direction: row;
    div {
      border-color: var(--mainDarken20);
      border-width: 3px;
      background-color: var(--mainDarken10);
      border-style: solid;
      border-radius: 1rem;
      padding: 0.25rem;
      margin: 0.25rem;
      h4 {
        margin: 0;
        color: var(--text);
      }
    }
  }
  button {
    border: none;
    background-color: var(--mainDarken10);
    width: max-content;
    padding: 0.5rem 2rem;
    border-radius: 1rem;
    color: var(--text);
    //text-transform: uppercase;
    transition: all 0.4s ease-in-out;
    cursor: pointer;
    font-family: "Poppins";
    font-weight: 500;
    &:hover {
      transform: scale(1.02);
      box-shadow: 0px 0px 10px inset rgba(255, 255, 255, 0.2);
    }
  }
</style>
