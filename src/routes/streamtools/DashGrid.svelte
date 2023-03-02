<script lang="ts">
</script>

<section class="inputGrid">
  <slot class="Wide100" />
</section>

<style lang="scss">
  section {
    display: grid;
    grid-column: span 2;
    width: 85%;
    //grid-template-columns: 1fr 1fr;
  }
  .inputGrid :global(> .inputBlock) {
    width: 100% !important;
  }
</style>
