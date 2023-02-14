<script lang="ts">
  // Add app and name
  import Chatter from "../Chatter.svelte";
  let appName = "chatter";
  //

  import "../../../../css/default.scss";
  import { onMount } from "svelte";
  import { runningApp } from "../../params";

  let [params, updateSettings] = Array(2).fill(new Object());
  let runApp = true;

  onMount(async () => {
    let urlData = new URLSearchParams(window.location.search);
    runApp = urlData.has("data");
    params = await runningApp(urlData, appName);

    // APP SPECIFIC
    if (!params.version) params.fontsize = params.fontsize * 16;
    if (!params["chatcolourCalc"]) params["chatcolourCalc"] = params.chatcolour;

    //KEEP
    updateSettings = params;
    console.log(params);
  });
</script>

<Chatter {params} {runApp} />
