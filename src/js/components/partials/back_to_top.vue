<style lang="scss">

  .back-to-top {
    position: fixed;
    bottom: 50px;
    right: 0px;
    text-decoration: none;
    color: #000000;
    background-color: transparent;
    font-size: 12px;
    padding: 1em;
    display: none;

    img {
    	opacity: 0.5;
    }
    &:hover img {
    	opacity: 0.7;
    }
  }

</style>

<template>

  <a href="#" class="back-to-top"><img src="/images/footer/icon_backtotop.png" /></a>

</template>

<script>

  function initBackToTop() {
    const offset = 220;
    const duration = 500;

    const $backToTop = $('.back-to-top');

    $(window).scroll(function() {
      if ($(this).scrollTop() > offset) {
        $backToTop.fadeIn(duration);
      } else {
        $backToTop.fadeOut(duration);
      }
    });

    $backToTop.click(function(event) {
      event.preventDefault();
      $('html, body').animate({scrollTop: 0}, duration);
      return false;
    })

  }

  $(document).ready(function() {
    initBackToTop();
  });

</script>
