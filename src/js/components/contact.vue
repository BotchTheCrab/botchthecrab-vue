<style lang="scss">

  @import "../../sass/_flexbox.scss";
  @import "../../sass/_variables.scss";

  .faq_Q, .faq_A {
    font-size: 1.2rem;
    line-height: 1.5em;
  }
  .faq_Q {
    margin-bottom: 0px;
    font-weight: bold;
  }
  .faq_A {
    margin-bottom: 2em;
    color: #BBBBBB;
  }

  .about-desc {
    text-align: center;

    .contact-methods {
      @include flexbox;
      @include flex-wrap(wrap);
      @include justify-content(space-around);

      @media (max-width: $bootstrap-xs-max) {
        a {
          margin: 0 50px;
        }
      }
    }
  }

</style>

<template>

  <div class="container-fluid center-content">

  	<!-- PAGE TITLE -->
  	<div class="page-title">Frequently Asked Questions</div>

  	<div class="about-desc">
      <div class="faq_Q">Can I use your images?</div>
      <div class="faq_A">Of course! That's what they're here for. If you were to put a link back to this site as a courtesy, however, that would be appreciated.</div>

      <div class="faq_Q">What about Generation 2, Machine Wars, Beast Wars, Armada, etc.?</div>
      <div class="faq_A">No plans at this point, but you never know.</div>

      <div class="faq_Q">How can I submit scans?</div>
      <div class="faq_A">You can send them to the email address below! Be sure to tell me where they came from.</div>

      <div class="faq_Q">I want to make reproduction boxes, do you have scans for&#133;?</div>
      <div class="faq_A">Nope, I don't have full-package scans.</div>

      <div class="faq_Q">That transformation sound is awesome!</div>
      <div class="faq_A">I agree. You can download it <a href="/archive/sounds/Transform.mp3" target="transform">here</a>.</div>

      <div class="faq_Q">Can you link to my site?</div>
      <div class="faq_A">If you contribute to this site, I will gladly mention or link to your site in the post that describes that update. Otherwise, probably not.</div>
  	</div>

  	<br/>
  	<br/>

  	<!-- PAGE TITLE -->
  	<div class="page-title">Contact</div>

    <div class="about-desc">
  		<p>For all other questions, comments, scorn or heapings of praise:</p>

      <div class="contact-methods">
        <a href="mailto:Botch@BotchTheCrab.com">Botch@BotchTheCrab.com</a>
        <a href="http://www.facebook.com/TransformersBoxArtArchive" target="facebook">Facebook</a>
        <a href="https://twitter.com/tfboxart" target="twitter">Twitter</a>
        <a href="https://www.instagram.com/tfboxart" target="instagram">Instagram</a>
      </div>
  	</div>


  	<div style="margin-top: 50px;"><img src="/images/menu_botch_trans2.png" /></div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  module.exports = {

    mounted() {
      globalService.setOfficeDocumentTitle('FAQ / Contact');
    }

  };

</script>
