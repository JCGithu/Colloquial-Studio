<script lang="ts">
  export let text = "";
</script>

<button on:click>{text}</button>

<style lang="scss">
  @import "../../css/colours.scss";
  button {
    font-family: "Poppins";
    font-size: large;
    border: none;
    height: max-content;
    font-weight: light;
    opacity: 1;
    color: white;
    justify-content: center;
    margin: 0.2rem;
    padding-left: 2rem;
    padding-right: 2rem;
    margin-bottom: 1rem;
    border-color: $colloquial;
    border-style: solid;
    border-width: 0px;
    border-top-width: 0.5px;
    //background-color: rgba(0, 0, 0, 0);
    background: linear-gradient(290deg, rgba(0, 0, 0, 0) 24%, $pink 25%);
    background-size: 600% 600%;
    background-position: 100% 100%;
    border-radius: 1rem;
    display: flex;
    width: max-content;
    align-self: center;
    flex-direction: column;
    transition: 1s cubic-bezier(0.26, 0.77, 0.06, 0.9);
    cursor: pointer;
    &:hover {
      opacity: 1;
      transform: scale(1.1);
      border-color: $white;
      background-position: 50% 100%;
      box-shadow: 0px 0px 10px fade-out($colloquial, 0.5);
    }
  }
</style>
