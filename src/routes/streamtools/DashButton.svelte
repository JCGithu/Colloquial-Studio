<script lang="ts">
  export let text = "";
</script>

<button on:click>{text}</button>

<style lang="scss">
  button {
    font-family: "Poppins";
    font-size: large;
    border: none;
    height: max-content;
    opacity: 0.5;
    background-color: #008080;
    color: white;
    justify-content: center;
    margin: 0.2rem;
    padding-left: 2rem;
    padding-right: 2rem;
    border-radius: 1rem;
    display: flex;
    width: max-content;
    align-self: center;
    flex-direction: column;
    transition: 0.35s cubic-bezier(0.71, 0.7, 0.41, 1.14) 0s !important;
    cursor: pointer;
    &:hover {
      opacity: 1;
    }
  }
</style>
