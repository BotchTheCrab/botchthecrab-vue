<style lang="scss">

  .botch_section {
  	margin-bottom: 100px;

    img {
      margin: 0 0 20px;
      border: 1px solid BLACK;
      box-shadow: 3px 3px 1px #222;
      max-width: 100%;

      &.no-shadow {
        box-shadow: none;
        border: 0;
      }
    }

    .about-desc {
      text-align: center;
      width: 80%;
    }
  }

</style>

<template>

  <div class="container-fluid">

    <div class="about-header">Botch the Crab</div>

    <div class="about-desc">For as long as this site has been online, Botch the Crab has been its official figurehead and mascot: a Decepticon by allegiance, a cassette by function, a crab by choice, and stalker of the shadows by necessity. Over the years, despite his snappish and reclusive ways, Botch has managed to inspire some fans to illustrate and even kitbash some tributes to him. (The ultimate goal is to one day get a small run of actual Botch toys produced by a third party.) Below is Botch's bio as well as many of those fantastic illustrations. Enjoy, and feel free to contribute!</div>


    <!-- Libessart -->
  	<div v-bind:class="getBotchSectionClasses()">
  		<div>
  			<a href="/images/botch/botch_laurent_libessart.jpg" class="fancybox-button-art" rel="fancybox-button" title="Botch the Crab - by Laurent Libessart" target="botch"><img src="/images/botch/botch_laurent_libessart_tn.jpg" /></a>

  			<a href="/images/botch/botch_cassette_laurent_libessart.jpg" class="fancybox-button-art" rel="fancybox-button" title="Botch the Crab (cassette mode) - by Laurent Libessart" target="botch"><img src="/images/botch/botch_cassette_laurent_libessart_tn.jpg" /></a>
  		</div>
  		<div class="about-desc">
  			Illustrations by <b><a href="http://a-loft-on-cybertron.deviantart.com/" target="laurent">Laurent Libessart</a></b>. <br/>
  			Graciously commissioned by <a href="http://rustingcarcass.yuku.com/forums/64/t/Carcass-Column.html" target="carcass"><b>Carcass</b></a>.
  		</div>
  	</div>

  	<!-- Digital! -->
  	<div v-bind:class="getBotchSectionClasses()">
  		<div>
  			<a href="/images/botch/botch_digital.png" class="fancybox-button-art" rel="fancybox-button" title="Digital Botch - by Rainking" target="botch"><img src="/images/botch/botch_digital.png" class="no-shadow" style="width:650px" /></a>
  			<a href="/images/botch/botch_digital_cassette.png" class="fancybox-button-art" rel="fancybox-button" title="Digital Botch (Cassette) - by Rainking" target="botch"><img src="/images/botch/botch_digital_cassette.png" class="no-shadow" /></a>
  		</div>
  		<div class="about-desc">
  			Digital Botch art by <strong>Rainking</strong> of <a href="http://www.iaconcity.com/" target="iacon">Iacon City</a>. <br/>
  			More Botch renders <a href="http://10fingersdesigns.com/3d/decepticons30.htm#botch" target="iacon">here</a>.
  		</div>
  	</div>


  	<!-- Stockel / Grimmbot -->
  	<div v-bind:class="getBotchSectionClasses(true)">
  		<div>
  			<a href="/images/botch/botch_stockel_grimmbot.jpg" class="fancybox-button-art" rel="fancybox-button" title="Very First Botch - by Jon Stockel with Grimmbot" target="botch"><img src="/images/botch/botch_stockel_grimmbot.jpg" /></a>
  		</div>
  		<div class="about-desc">
  			The very first Botch art by <strong>Jon Stockel</strong>. <br/>
  			Retouched, reformatted and retouched again by <strong>Grimmbot</strong>.
  		</div>
  	</div>


  	<!-- Brendan Cahill -->
  	<div v-bind:class="getBotchSectionClasses()">
  		<div>
  			<a href="/images/botch/Botch_BrendanCahill.jpg" class="fancybox-button-art" rel="fancybox-button" title="Botch by Brendan Cahill" target="botch"><img src="/images/botch/Botch_BrendanCahill.jpg" /></a>
  		</div>
  		<div class="about-desc">A sketch by IDW Transformers comic artist <strong><a href="http://tfwiki.net/wiki/Brendan_Cahill" target="cahill">Brendan Cahill</a></strong>, commissioned and completed at CybFest 2014.</div>
  	</div>


  	<!-- Jackpot -->
  	<div v-bind:class="getBotchSectionClasses(true)">
  		<div>
  			<a href="/images/botch/Botch_Jackpot.jpg" class="fancybox-button-art" rel="fancybox-button" title="Botch underwater - by Matt Kuphaldt" target="botch"><img src="/images/botch/Botch_Jackpot.jpg" /></a>
  		</div>
  		<div class="about-desc">A sketch by Transformers artist <strong><a href="http://tfwiki.net/wiki/Matt_Kuphaldt" target="jackpot">Matt Kuphaldt</a></strong> of <strong><a href="http://www.spektakle.com/" target="spektakle">Spektkle Artistic Services</a></strong>, commissioned and completed at CybCon 2013.</div>
  	</div>


  	<!-- Zobovor -->
  	<div v-bind:class="getBotchSectionClasses()">
  		<div>
  			<a href="/images/botch/botch_zobovor.png" class="fancybox-button-art" rel="fancybox-button" title="Botch, animation-style - by Zobovor" target="botch"><img src="/images/botch/botch_zobovor.png" class="no-shadow" /></a>
  		</div>
  		<div class="about-desc">
  			The inimitable <strong><a href="http://members.fortunecity.com/zobovor/" target="zobovor">Zobovor</a></strong> did this rendition of Botch in the style of the original cartoon!
  		</div>
  	</div>


  	<!-- Deruji -->
  	<div v-bind:class="getBotchSectionClasses(true)">
  		<div>
  			<a href="/images/botch/Botch_~deruji.png" class="fancybox-button-art" rel="fancybox-button" title="Botches - by ~Deruji" target="botch"><img src="/images/botch/Botch_~deruji.png" style="border: 2px solid BLACK; width: 100%; max-width: 960px;"></a>
  		</div>
  		<div class="about-desc">
        Botch gets lost in a crowd of himselves in this digital render by <strong><a href="http://deruji.deviantart.com/" target="deruji">~Deruji</a></strong>.
      </div>
  	</div>


  	<!-- ~hellbat -->
  	<div v-bind:class="getBotchSectionClasses()">
  		<div>
  			<a href="/images/botch/Botch_~hellbat.jpg" class="fancybox-button-art" rel="fancybox-button" title="Botch - by ~hellbat" target="botch"><img src="/images/botch/Botch_~hellbat.jpg" /></a>
  		</div>
  		<div class="about-desc">
  			Terrifying Botch by <b><a href="http://hellbat.deviantart.com/" target="hellbat"><strong>navtej heer, aka ~hellbat</strong></a></b>.
  		</div>
  	</div>


  	<!-- Sushi -->
  	<div v-bind:class="getBotchSectionClasses(true)">
  		<div>
  			<a href="/images/botch/botch_sushi.jpg" class="fancybox-button-art" rel="fancybox-button" title="Botch Sushi! - by Matthew Stein" target="botch"><img src="/images/botch/botch_sushi.jpg" /></a>
  		</div>
  		<div class="about-desc">
  			Botch Sushi image by <b><a href="http://www.MatthewStein.net" target="_blank">Matthew Stein</a></b>
  		</div>
  	</div>


  	<!-- TechSpec -->
  	<div v-bind:class="getBotchSectionClasses()">

  		<div>
  			<a href="/images/botch/botch_techspec.jpg" class="fancybox-button-art" rel="fancybox-button" title="Botch Tech Spec - rendered by Slim" target="ts" ><img src="/images/botch/botch_techspec.jpg" /></a>
  			<div class="about-desc">
  				The JPG version of Botch's Tech Spec comes courtesy of <br/>
  				<a href="http://www.ocf.berkeley.edu/~mingus/tech/" target="Credit">Slim's Custom Transformers Tech Specs</a>.
  			</div>
  		</div>
  	</div>


  	<!-- Cardback -->
  	<div v-bind:class="getBotchSectionClasses()">
  		<div>
  			<<a href="/images/botch/botch_cardback_front.jpg" class="fancybox-button-art" rel="fancybox-button" title="Botch Cardback (front) - by Archangel" target="botch"><img src="/images/botch/botch_cardback_front.jpg" /></a>

  			<a href="/images/botch/botch_cardback_back.jpg" class="fancybox-button-art" rel="fancybox-button" title="Botch Cardback (back) - by Archangel" target="botch"><img src="/images/botch/botch_cardback_back.jpg" /></a>
  		</div>
  		<div class="about-desc">
  			Botch Cardback image by <b><a href="http://sites.google.com/site/primularchangel/" target="_blank">Archangel</a></b>
  		</div>
  	</div>


  </div>

</template>

<script>

  var globalService = require('services/global_service');

  module.exports = {

    data () {
      return {
        botchSectionClasses: "botch_section col-lg-6"
      }
    },

    components: {
    },

    beforeMount() {
    },

    mounted() {
      globalService.setOfficeDocumentTitle("About Botch");
    },

    methods: {

      getBotchSectionClasses: function(clearLeft) {
        return this.botchSectionClasses + (clearLeft ? ' clearLeft' : '');
      }

    },

    computed: {

    }


  };

</script>
