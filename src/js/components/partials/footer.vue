<style>
  /* */
</style>

<template>

  <div>

    <!-- transformation sound -->
    <div id="sfx-container">
      <sfx></sfx>
    </div>

    <!-- Search -->
    <div class="footer-item">
      <form id="footer-search-form" @submit.prevent="submitSearch">
        <a href="/postings" title="Search"><img src="/images/footer/icon_search.png" alt="Search" /></a>
        <input type="search" v-model="searchTerm" placeholder="Search ..." />
      </form>
    </div>

    <!-- Email -->
    <div class="footer-item"><a href="/contact" title="Email Botch the Crab"><img src="/images/footer/icon_email.svg" alt="Email Botch the Crab" /></a></div>

    <!-- Facebook -->
    <div class="footer-item"><a href="http://www.facebook.com/TransformersBoxArtArchive" target="facebook" title="Follow the Archive on Facebook"><img src="/images/footer/icon_facebook.svg" alt="Facebook" /></a></div>

    <!-- Twitter -->
    <div class="footer-item"><a href="https://twitter.com/tfboxart" target="twitter" title="Follow the Archive on Twitter"><img src="/images/footer/icon_twitter.svg" alt="Twitter" /></a></div>

    <!-- Instagram -->
    <div class="footer-item"><a href="https://www.instagram.com/tfboxart" target="instagram" title="Follow the Botch on Instagram"><img src="/images/footer/icon_instagram.svg" alt="Instagram" /></a></div>

    <!-- RSS -->
    <!-- <div class="footer-item"><a href="/rssxml.asp" target="rss" title="Follow this Site via RSS"><img src="/images/footer/icon_rss.png" alt="RSS" border="0"></a></div> -->

    <!-- Paypal -->
    <div class="footer-item">
      <form action="https://www.paypal.com/donate" method="post" target="_blank">
        <input type="hidden" name="hosted_button_id" value="K8CYS282A2L6S" />
        <input type="image" src="/images/footer/icon_paypal.gif" border="0" name="submit" alt="Donate to BotchTheCrab.com through Paypal" title="Donate to the Archive">
        <img alt="" border="0" src="https://www.paypal.com/en_US/i/scr/pixel.gif" width="1" height="1" />
      </form>
    </div>

  </div>

</template>

<script>

  module.exports = {

    data() {
      return {
        searchTerm: ''
      }
    },

    methods: {

      submitSearch: function() {
        this.$router.push({
          path: '/postings',
          query: {
            search: this.searchTerm
          }
        });
        this.searchTerm = '';
      }

    }

  };

</script>
