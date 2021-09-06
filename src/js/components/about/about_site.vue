<style lang="scss">

  #aboutSite {
    font-size: 1em;
    width:	700px;
    max-width:	90%;
    margin:	0 auto 50px;
  }

  #aboutHeader {
    margin-bottom:  30px;
  }

  #aboutSiteText {
    text-align: left;
  }

  #aboutSiteText p {
    margin-bottom: 20px;
  }

  #aboutSiteText ul {
    margin-top:  10px;
    margin-bottom:  15px;
    padding-left: 15px;
  }
  #aboutSiteText li {
    list-style-type: none;
    margin-bottom:  5px;
  }

  .aboutSiteHeader {
    font-style: italic;
    color: #ccc;
    font-size: 1.4em;
  }

  #aboutSiteRamhorn {
    padding-bottom: 20px;
    text-align:
    center;
  }
  #aboutSiteRamhorn img {
    margin-right: 20px;
    max-width: 100%;
  }

</style>

<template>

  <div id="aboutAdam">

    <div id="aboutHeader">About This Site</div>

  	<div>
  		<div id="aboutSiteRamhorn" class="col-sm-4 col-xs-12">
  			<a class="fancybox-button-art" rel="fancybox-button" title="Botch digs JavaScript" data-character="Botch digs JavaScript" href="/archive/images/javascript_ramhorn_large.jpg" target="_blank">
  				<img src="/archive/images/javascript_ramhorn_large.jpg" title="Transformers O'Reilly parody">
  			</a>
  		</div>

  		<div id="aboutSiteText" class="col-sm-8 col-xs-12">

        <div class="aboutSiteHeader">GitHub:</div>
        <ul>
          <li><a href="https://github.com/BotchTheCrab/botchthecrab-vue" target="github">https://github.com/BotchTheCrab/botchthecrab-vue</a></li>
        </ul>

  			<div class="aboutSiteHeader">Built with ...</div>
  			<ul>
          <li><a href="https://vuejs.org/">Vue.js (v2)</a> framework</li>
  				<li><a href="https://sass-lang.com/" target="sass">SASS</a> and Vue compilation via <a href="https://gulpjs.com/" target="gulp">Gulp</a></li>
  				<li>Hosting via <a href="https://firebase.google.com/" target="firebase">Google Firebase</a> with Realtime Database</li>
  			</ul>

  			<div class="aboutSiteHeader">Supplementary JavaScript Libraries:</div>
  			<ul>
  				<li><a href="http://jquery.com/" target="jquery">jQuery</a></li>
  				<li><a href="http://underscorejs.org/" target="underscore">Underscore</a></li>
  				<li><a href="http://getbootstrap.com/" target="bootstrap">Bootstrap</a></li>
  			</ul>

  			<div class="aboutSiteHeader">Plugins/Widgets:</div>
  			<ul>
  				<li><a href="http://mmenu.frebsite.nl/" target="mmenu">mmenu</a> - site navigation</li>
  				<li><a href="http://fancyapps.com/fancybox/" target="fancybox">fancyBox</a> - box art modals</li>
          <li><a href="http://labs.rampinteractive.co.uk/touchSwipe/demos/" target="touchswipe">TouchSwipe</a> - swipe effects</li>
  				<li><a href="https://codepen.io/markhillard/pen/Hjcwu" target="audioplayer">Responsive Audio Player by Mark Hillard</a></li>
  			</ul>

  			<div class="aboutSiteHeader">Tools:</div>
  			<ul>
  				<li><a href="https://atom.io/" target="atom">Atom</a></li>
  				<li><a href="http://www.photoshop.com/products/photoshop" target="photoshop">Adobe Photoshop</a></li>
  			</ul>

  		</div>
  	</div>

    <br clear="all" />

  </div>

</template>

<script>

  var globalService = require('services/global_service');

  module.exports = {

    data () {
      return {
      }
    },

    components: {
    },

    beforeMount() {
    },

    mounted() {
      globalService.setOfficeDocumentTitle("About This Site");
    },

    methods: {


    },

    computed: {

    }


  };

</script>
