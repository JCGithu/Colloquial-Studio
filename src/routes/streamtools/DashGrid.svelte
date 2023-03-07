<script lang="ts">
  import { setContext } from "svelte";
  setContext("grid", true);
</script>

<section class="inputGrid">
  <slot />
</section>

<style lang="scss">
  section {
    display: grid;
    grid-column: span 2;
    width: 85%;
    padding: 0rem 0.5rem;
    //grid-template-columns: 1fr 1fr;
  }
</style>
