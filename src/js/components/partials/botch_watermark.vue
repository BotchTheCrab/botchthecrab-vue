<style lang="scss">

  #watermark {
    position: fixed;
    z-index: 0;
    left: 25px;
    top: 25px;

    .mm-opened & { display: none; }

    img {
      width: 100%;
      max-width: 200px;
    }
  }

</style>

<template>

  <div id="watermark" class="hidden-sm hidden-xs">
  	<a href="/about/botch"><img src="/images/botch/botch_mascot_laurent.png" /></a>
  </div>

</template>

<script>
  /* */
</script>
