<script lang="ts">
  import { onMount } from "svelte";
  onMount(() => {
    let baseURL = window.location.href;
    window.location.replace(baseURL.split("/games")[0]);
  });
</script>
