<style lang="scss">

#trio {
  margin-bottom: 	100px;

  img {
    border: 1px solid BLACK;
    box-shadow: 3px 3px 1px #222;
    max-width:	100%;
  }

  .credit {
    padding: 5px;
    font-size: 0.9em;
    color: #ccc;
    font-style: italic
  }

  .aboutDesc {
    max-width: 700px;

    hr {
      margin: 25px auto;
    }
  }

}

</style>

<template>

  <div class="container-fluid" id="trio">

    <div id="aboutHeader">Botch's Fellow Cassettes:<br/>Bungle & Fuck-Up</div>

    <div>
  		<img src="/images/botch/trio.jpg" />
  	</div>
  	<div class="credit">Digital art by <strong>Rainking</strong> of <a href="http://www.iaconcity.com/" target="iacon">Iacon City</a>. <span class="nowrap">More renders <a href="http://10fingersdesigns.com/3d/decepticons30.htm#botch" target="iacon">here</a>.</span></div>

  	<div class="aboutDesc">
  		<p>Orphaned from their communicator host, three cassette operatives remain together as a semi-autonomous espionage unit for Decepticon Intelligence. Like many unfortunate Decepticons, their unflattering code names were bestowed upon them early in their career by unimpressed superior officers as a badge of ridicule. However, since that notorious debacle, the trio have persistently worked to vindicate and neuter their familiar handles. Well, at least Botch and Bungle. Fuck-Up pretty much remains a fuck-up.</p>

      <hr/>

  		<p><i>These three characters are based on me (the black crab), my best friend and long-time roommate (the periwinkle ape), and our mutual high school friend and roommate for one cockroach-infested year (the yellow bird).  Bungle knows who he is. Fuck-Up will forever remain clueless, in this and all other matters.</i></p>
  	</div>




  	<!-- BUNGLE -->

  	<div class="pageTitle">Bungle</div>

  	<div align="center"><img src="/images/botch/bungle_large.gif" /></div>
    <div class="credit">Bungle's box art is <a v-on:click="tf('Beastbox', 'Decepticon', '1988')">Beastbox</a> recolored.</div>

  	<br/><br/>

  	<div>
  		<a href="/images/botch/bungle_techspec.jpg" class="fancybox-button-art" rel="fancybox-button" title="Bungle Tech Spec - rendered by Slim" target="ts" ><img src="/images/botch/bungle_techspec.jpg" /></a>
  		<div class="aboutDesc" style="text-align: center">
  			The JPG version of Bungle's Tech Spec comes courtesy of <br/>
  			<a href="http://www.ocf.berkeley.edu/~mingus/tech/" target="Credit">Slim's Custom Transformers Tech Specs</a>.
  		</div>
  	</div>

  	<br/><br/>

  	<div align="center"><img src="/images/botch/digital_bungle.jpg" /></div>


    <br/><br/>
    <br/><br/>


  	<!-- FUCK-UP -->

  	<div class="pageTitle">Fuck-Up</div>

  	<div align="center"><img src="/images/botch/fuck-up_large.gif" alt="Fuck-Up"></div>
    <div class="credit">Fuck-Up's box art is <a v-on:click="tf('Laserbeak', 'Decepticon', '1984')">Laserbeak</a> recolored.</div>

  	<br/><br/>

  	<div>
  		<a href="/images/botch/fuck-up_techspec.jpg" class="fancybox-button-art" rel="fancybox-button" title="Fuck-Up Tech Spec - rendered by Slim" target="ts" ><img src="/images/botch/fuck-up_techspec.jpg" /></a>
  		<div class="aboutDesc" style="text-align: center">
  			The JPG version of Fuck-Up's Tech Spec comes courtesy of <br/>
  			<a href="http://www.ocf.berkeley.edu/~mingus/tech/" target="Credit">Slim's Custom Transformers Tech Specs</a>.
  		</div>
  	</div>

  	<br/><br/>

  	<div align="center"><img src="/images/botch/digital_fuck-up.jpg" alt="Fuck-Up" /></div>

  </div>

</template>

<script>

  // GLOBAL COMPONENTS
  var globalService = require('services/global_service');

  // ARCHIVE COMPONENTS
  var archiveService = require('services/archive_service');

  module.exports = {

    components: {
    },

    beforeMount() {
    },

    mounted() {
      globalService.setOfficeDocumentTitle("About Botch's Fellow Cassettes");
    },

    methods: {

      tf: function(name, faction, year) {
        archiveService.tf(name, faction, year);
      }

    },

    computed: {

    }


  };

</script>
