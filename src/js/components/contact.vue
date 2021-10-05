<style lang="scss">

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

</style>

<template>

  <div class="container-fluid center-content">

  	<!-- PAGE TITLE -->
  	<div class="page-title">Frequently Asked Questions</div>

  	<div class="about-desc">
      <div class="faq_Q">Can I use your images?</div>
      <div class="faq_A">Sure, it's not like they're really <i>mine</i>. If you were to put a link back to my site as a courtesy, that would be appreciated. Alternatively, you could <a href="/archive/help.asp">submit scans, edit scans or donate funds</a>!</div>

      <div class="faq_Q">I want to make reproduction boxes, do you have scans for&#133;?</div>
      <div class="faq_A">Nope, I don't have full-package scans.</div>

      <div class="faq_Q">That transformation sound is awesome!</div>
      <div class="faq_A">I agree. You can download it <a href="/archive/images/Transform.zip">here</a>.</div>

      <div class="faq_Q">Ever going to archive G2?</div>
      <div class="faq_A">Ask me again next year.</div>

      <div class="faq_Q">What about Machine Wars, Beast Wars, Armada, etc.?</div>
      <div class="faq_A">Very unlikely. But you never know.</div>

      <div class="faq_Q">Can you link to my site?</div>
      <div class="faq_A">If you contribute to this site, I will gladly mention or link to your site in the post that describes that update. Otherwise, probably not.</div>
  	</div>

  	<br/>
  	<br/>

  	<!-- PAGE TITLE -->
  	<div class="page-title">Contact</div>

  	<div class="about-desc" style="">
  		<p>For all other questions, comments, scorn or heapings of praise:</p>
  		<p><a href="mailto:Botch@BotchTheCrab.com"><b>Botch@BotchTheCrab.com</b></a></p>
  	</div>


  	<div style="margin-top: 50px;"><img src="/images/menu_botch_trans2.png" /></div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // BLOG COMPONENTS
  var blogService = require('services/blog_service');

  var vm;
  var postingsStore = null;
  var numPostingsDisplayed = 0;
  var numPostingsPerLoad = 5;

  module.exports = {

    data () {
      return {

      }
    },

    mounted() {
      globalService.setOfficeDocumentTitle('FAQ / Contact');

    }

  };

</script>
