<script>
  export let message = "";
  import { fly, fade } from "svelte/transition";
</script>

<div transition:fade id="toast">
  {message}
</div>

<style lang="scss">
  @import "../css/dashboard.scss";
</style>
