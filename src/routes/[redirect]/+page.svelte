<script>
  export let data;
  console.log(data.url);
  import { onMount } from "svelte";
  onMount(() => {
    //let baseURL = window.location.protocol + "//" + window.location.host;
    //console.log(baseURL);
    window.location.replace(data.url);
  });
</script>
