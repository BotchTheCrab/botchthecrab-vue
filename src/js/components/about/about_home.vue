<style lang="scss">

  .about-group { padding: 0; }

  .about-section {
    padding: 0 25px;

    .about-section-header {
      background-color: #2C244C;
      background-color: #000;
      border: 1px solid #000;
      border: 1px solid #333;
      padding: 5px;
      font-weight: bold;
      text-align: center;
      cursor: pointer;
    }

    .about-section-content {
      background-color: #EEEEEE;
      color: BLACK;
      font-size: 11px;
      border: 1px solid #000;
      border: 1px solid #333;
      border-top: 0;
      padding: 10px 10px 0;
      margin-bottom: 25px;
      text-align: left;

      a {
        color: #2C244C;
        font-style: italic;
        font-size: 1.1em;
      }
      br {
        clear: both;
      }
      p {
        margin: 0 0 10px;
      }
      img {
        border: 1px solid #555;
        float: right;
        margin: 0 0 10px 10px;
      }
    }
  }

  #sideways-scuttle {
    clear: both;
    max-width: 500px;
    margin: 10px auto;
    font-size: 0.8em;
  }

</style>

<template>

  <div class="container-fluid">

    <div class="about-header">About &#133;</div>

  	<div v-bind:class="aboutGroupClasses">

      <div v-bind:class="aboutSectionClasses">
  			<div class="about-section-header" onclick="location.href='/archive'">Botch's Transformers Box Art Archive</div>
  			<div class="about-section-content">
  				<a href="/archive"><img src="/archive/autobot/1984/Z_optimus_prime.gif" /></a>

  				<p>Online since 1998, this site attempts to archive high-quality edited scans of all the original (Generation One) Transformers package art. The Archive also hosts scans of all the G1 tech specs and instructions, as well as a gallery of back-of-the-box art.</p>

  				<p><a href="/archive">Head to the Archive ...</a></p>
  				<br/>
  			</div>
  		</div>

      <div v-bind:class="aboutSectionClasses">
  			<div class="about-section-header" onclick="location.href='/about/botch'">Botch the Crab</div>
  			<div class="about-section-content">
  				<a href="/about/botch"><img src="/images/about/about_botch.jpg" /></a>

  				<p>This Decepticon cassette-crustacean is the Archive's mascot and the webmaster's online alter-ego. Devious, eloquent and determined to one day get his own toy.</p>

  				<p><a href="/about/botch">More about Botch ...</a></p>
  				<br/>
  			</div>
  		</div>

  	</div>

    <div v-bind:class="aboutGroupClasses">

      <div v-bind:class="aboutSectionClasses">
  			<div class="about-section-header" onclick="location.href='/about/adam'">The Blog</div>
  			<div class="about-section-content">
  				<a href="/about/adam"><img src="/images/about/adam/about_adam_incantation.jpg" /></a>

  				<p>Adam Alexander is the human behind the black crab. In addition to introducing updates to the Archive, he blogs about life, society and, of course, Transformers.</p>

  				<p><a href="/about/adam">More about Adam ...</a></p>
  				<!-- <p><a href="/postings">Read the latest posts ...</a></p> -->
  				<br/>
  			</div>
  		</div>

      <div v-bind:class="aboutSectionClasses">
  			<div class="about-section-header" onclick="location.href='/about/music'">His Music</div>
  			<div class="about-section-content">
  				<a href="/about/music"><img src="/images/about/about_music.jpg" /></a>

  				<p>Adam has been a versatile musician and produced several diverse and experimental rock albums. Listen for free, name-your-price to buy!</p>

  				<p><a href="/about/music">Listen to some music ...</a></p>
  				<br/>
  			</div>
  		</div>

  	</div>

    <!-- <pre id="sideways-scuttle">
    This be Botch. Hello all.
    Welcome to miasmic halls.
    This common click ties thou and we,
    when clicking through the net we be:
    I, the click of pedal units
    dancing on metallic floors;
    you, a fat flat-headed mouse,
    or keys for those the pet abhors.

    Cloak and dagger be my run...
    well, cloak and acid-pellet gun.
    Decepticon (but aren't we all?);
    caustic; cold; with twice the gall
    of bots three four five times my size:
    modesty is not my pride.
    I'm known to code a line or two
    that rhymes for me, if not for you.

    But I digress; this matters not.
    Our welcome turned into a jot
    about ourselves and how we be.
    I meant to say: do visit me!
    My office door is likewise wide
    to fleshlings, Autobots and spies.
    Recover us to ebon seas
    Where ebon we swims deviously.
    </pre> -->

  </div>

</template>

<script>

  var globalService = require('services/global_service');

  module.exports = {

    data () {
      return {
        aboutGroupClasses: "about-group col-lg-6 col-md-12 col-sm-12 col-xs-12",
    		aboutSectionClasses: "about-section col-lg-6 col-md-6 col-sm-6 col-xs-12"
      }
    },

    mounted() {
      globalService.setOfficeDocumentTitle("About ...");
    }

  };

</script>
