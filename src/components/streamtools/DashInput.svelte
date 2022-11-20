<script>
  export let name = null,
    subtitle = null,
    id = null,
    type = null,
    min = null,
    max = null,
    ops = null,
    value = null,
    grouped = null,
    faded = false;
  export let params;
  import { hexToHSL } from "../../js/hexToHSL";

  import { createEventDispatcher, afterUpdate } from "svelte";
  const dispatch = createEventDispatcher();

  let style = {};
  let invert = false;
  let titleBlock = true;
  let dashInputValue = "";

  let valueUpdate = (e) => {
    value = e.target.value;
    if (type === "checkbox") value = e.target.checked;
    if (type === "color") {
      let hsl = hexToHSL(e.target.value);
      invert = false;
      if (hsl.l >= 70) invert = true;
    }
    dispatch("valueChange", { value: value, id: id });
  };

  //if (grouped) style.width = "100%";
  let direction = "";
  if (type === "select") {
    direction = "row";
    if (subtitle) direction = "column";
  }

  if (type === "color" && !value) value = "#ffffff";
  if (type === "checkbox") titleBlock = false;
  if (faded) style.opacity = 0.5;
  //let styleString = style.stringify();

  afterUpdate(() => {
    console.log("faded", faded);
    if (!params) return;
    dashInputValue = params[id];
    if (type === "color" && dashInputValue) {
      value = dashInputValue;
      let hsl = hexToHSL(dashInputValue);
      invert = false;
      if (hsl.l >= 70) invert = true;
    }
    if (faded) {
      style.opacity = 0.5;
    } else {
      style.opacity = 1;
    }
    //stringStyle = style.stringify();
  });
</script>

<div style="{grouped ? 'width:100%;' : ''} flex-direction: {direction}; opacity:{faded ? 0.5 : 1};">
  {#if titleBlock}
    <h2>{name}</h2>
    {#if subtitle}
      <p>{subtitle}</p>
    {/if}
  {/if}
  {#if type === "select"}
    <select {type} {id} {min} {max} value={dashInputValue ? dashInputValue : ops[0].value} on:input={valueUpdate}>
      {#each ops as op}
        <option value={op.value}>{op.name}</option>
      {/each}
    </select>
  {:else if type === "color"}
    <div class="colourBlock"><p id="colourfontcolour" class={invert ? "invert" : ""}>{value}</p></div>
    <input {type} {id} {min} {max} value={dashInputValue ? dashInputValue : ""} on:input={valueUpdate} />
  {:else if type === "checkbox"}
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label style={subtitle ? "flex-direction: column" : ""} class="checkContainer">
      <div>
        <h2>{name}</h2>
        <input {type} {id} {min} {max} checked={dashInputValue ? dashInputValue : false} on:change={valueUpdate} />
        <span class="checkmark" />
      </div>
      {#if subtitle}
        <p>{subtitle}</p>
      {/if}
    </label>
  {:else}
    <input {type} {id} {min} {max} value={dashInputValue ? dashInputValue : ""} on:input={valueUpdate} />
  {/if}
</div>

<style lang="scss">
  .invert {
    color: black;
  }
  @import "../../css/dashinput.scss";
</style>
