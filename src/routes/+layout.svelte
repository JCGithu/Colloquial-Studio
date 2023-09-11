<script lang="ts">
  import { fly, fade, slide } from "svelte/transition";
  import { setContext } from "svelte";
  import SVGIcon from "../components/SVGIcon.svelte";

  let toastArray: Array<{ message: string; id: number; code: string }> = [];

  //TOAST
  let toastID = 0;
  function ToastQueue(message: string, code: string) {
    toastID++;
    toastArray.push({ message: message, id: toastID, code: code });
    toastArray = toastArray;
    setTimeout(() => {
      if (toastArray.length > 0) {
        toastArray.shift();
        toastArray = toastArray;
      }
    }, 5000);
  }
  export const toastUpdate = (i: string, c: string) => {
    ToastQueue(i, c);
  };
  setContext("toast", toastUpdate);
</script>

<div id="toastBox">
  {#each toastArray as toasty (toasty.id)}
    <div transition:slide class="toast {toasty.code}">
      {toasty.message}
    </div>
  {/each}
</div>
<slot />

<style lang="scss">
  @use "../css/default.scss" as d;
  @use "../css/colours.scss" as *;

  * {
    font-family: "Poppins";
  }

  //TOAST
  #toastBox {
    position: absolute;
    width: calc(33vw - 3rem);
    height: calc(100% - 1rem);
    left: 0;
    bottom: 0;
    z-index: 30;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding-bottom: 1rem;
    flex-direction: column;
    pointer-events: none;
    @media screen and (max-width: d.$phone) {
      height: 50%;
      bottom: 75%;
      left: 25%;
      width: 50%;
    }
  }

  .toast {
    background-color: $white;
    color: $black;
    border-radius: 0.5em;
    padding: 0.5em;
    margin: 0.2em;
    width: 250px;
    text-align: center;
    pointer-events: visible;
    cursor: pointer;
    transition: all 0.3s;
    &:hover {
      background-color: $black;
    }
  }
</style>
