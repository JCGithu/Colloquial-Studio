<script lang="ts">
  import { onMount } from "svelte";
  onMount(() => {
    let baseURL = window.location.href;
    window.location.replace(baseURL.split("/streamtools")[0]);
  });
</script>
