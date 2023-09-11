<script lang="ts">
  import { setContext } from "svelte";
  import Dash from "./DashExport";
  setContext("grid", true);
</script>

<section class="inputGrid">
  <slot {Dash} />
</section>

<style lang="scss">
  section {
    display: grid;
    grid-column: span 2;
    width: 85%;
    padding: 0rem 0.5rem;
  }
</style>
