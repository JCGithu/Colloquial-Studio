<script lang="ts">
  export let text = "";
  export let background = true;
  export let customClass = "";
</script>

<button type="button" class={customClass} class:background on:click on:submit>
  <span>
    {text}
    <slot />
  </span>
</button>

<style lang="scss">
  @use "../css/colours.scss" as *;
  button {
    font-family: "Poppins";
    font-size: normal;
    display: table-cell;
    width: max-content;
    align-self: center;
    justify-content: center;
    font-weight: normal;
    height: max-content;
    vertical-align: middle;
    color: white;

    margin: 0.2rem 0.2rem 1rem 0.2rem;
    padding: 0.1rem 2rem;

    border: $colloquial solid 0.5px;
    border-radius: 1rem;
    transition: all 1s cubic-bezier(0.26, 0.77, 0.06, 0.9), transform 250ms cubic-bezier(0.25, 0.25, 0.5, 1.9);
    cursor: pointer;

    &:hover {
      font-weight: bold;
      transform: scale(1.02) translateY(-4%);
      border-color: $white;
      box-shadow: 0px 0px 10px fade-out($colloquial, 0.5);
    }
    &:active {
      transform: translateY(0rem);
    }
    &::-moz-focus-inner {
      border: 0;
      padding: 0;
      outline: 0;
    }
  }
  span {
    display: block;
    height: inherit;
    &:hover {
      transform: none;
    }
  }
  .background {
    background: linear-gradient(290deg, rgba(0, 0, 0, 0) 24%, $colloquial 25%);
    background-size: 600% 600%;
    background-position: 100% 100%;
    &:hover {
      background-position: 50% 100%;
    }
  }
</style>
