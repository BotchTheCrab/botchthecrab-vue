<style lang="scss">

  #about-adam {
    text-align: justify;
    width: 600px;
    max-width: 90%;
    margin: 0 auto 50px;
    text-align: left;

    .about-header {
      font-size: 3.5em;
    }

    #externalLinks {
      ul {
        display: flex;
        justify-content: space-around;
        margin: 0;
        padding: 0;

        li {
          position: relative;
          display: inline-block;
          flex-grow: 1;
          text-align: center;

          &:not(:first-of-type) {
            padding-left: 5px;

            &::before {
              content: "•";
              position: absolute;
              left: 0;
            }
          }
        }
      }
    }

    p {
      font-size: 0.9em;
      line-height: 1.5em;

      img {
        border: 1px solid BLACK;
        box-shadow: 4px 4px 1px #222;
        max-width: 40%;
      }
    }

  }

</style>

<template>

  <div id="about-adam">

    <div class="about-header">Adam Alexander</div>

    <div id="externalLinks" class="about-desc">
      <ul>
        <li><a href="/images/about/adam/adam-alexander-resume-2021.pdf" target="resume">R&#0233;sum&#0233;</a></li>
        <li><a href="https://github.com/BotchTheCrab" target="github">GitHub</a></li>
        <li><a href="https://www.linkedin.com/in/adam-alexander-7b99b7b0/" target="linkedin">LinkedIn</a></li>
        <li><a href="https://twitter.com/BotchTheCrab" target="twitter">Twitter</a></li>
      </ul>
    </div>

    <p><img src="/images/about/adam/about_adam_dlg_4.jpg" class="post-image-left" title="Performing with Die Like Gentlemen" />

    <p>My first lifelong love was Godzilla. As a little kid I would scan the TV guides on the weekends to make sure I didn't miss a single movie featuring Godzilla (or any other giant monster). I wanted to be Godzilla. I wanted to stomp on the world, make the bullies pay, then leave and be left alone.</p>

    <p>My second lifelong love was the Transformers. Giant warring robots from another planet really spoke to me. We didn't have much money, so I typically had to wait for birthdays or holidays to acquire a new Transformer. At the age of thirteen I got my first after-school job in order to buy my own Autobots and Decepticons. (And comic books, especially Hulk comics, for which I have a lifelong like, if not love.)</p>

    <p>My third lifelong love was music. At first it was mostly hard rock (Aerosmith, Led Zeppelin), but discovering Black Sabbath spawned a life-long love of heavy metal, while Mr. Bungle proved there really are no rules when it comes to music and genres. Once I picked up a guitar, my Transformers went into stasis in a large cardboard box in the basement.</p>

    <p>I spent my high school years writing eclectic songs and playing guitar for my first band, <a href="https://crayoladeath.bandcamp.com/" target="crayola">Crayola Death</a>. All I wanted was to play rock music, but attending college is what was expected of me. Circumstances and contrarianism conspired to send me to a Catholic unversity (despite my lifelong adamant atheism) to study musicology, but it disagreed with me, so I switched to studying math, then philosophy, then theology, etc. I was aimless.</p>

    <p>My fourth lifelong love was New York City. My best friend was attending NYU, and when I visited him, I fell in love with the chaos, sleeplessness, and freedom of New York. I transferred to NYU, and while I continued to put in the minimum attention to school, I immersed myself in city life. When I absent-mindedly failed to secure funding for my fourth year of college, I happily dropped out to work odd jobs from "fire guard" to managing an ice cream store.</p>

    <p>During this time I formed <a href="https://bromptonscocktail.bandcamp.com" target="cocktail">Brompton's Cocktail</a>, an experimental rock quartet, and in addition to songwriting and guitar-playing, I took on the role of singer for the first time. I later helped form <a href="https://drpsyclops.bandcamp.com/" target="drpsyclops">The Invincible Doctor Psyclops Invasion</a>, a cinematic spy-rock outfit, wherein I switched from guitar to keyboards, theremins, samples and avant-garde vocalizations. In the wake of both of those bands, I founded <a href="https://themonsterproject.bandcamp.com/" target="monster">The Monster Project</a>, a rock/jazz septet that performed Godzilla and other monster movie soundtrack selections. (I played bass for that project, occasionally with a bow, and conducted.)</p>

    <p>My fifth lifelong love was the internet, whereby I rediscovered my love of Autobots and Decepticons. At first it was a happenstance encounter of some classic Transformers box art online. This burst of nostalgia led to the unearthing of the afore-mentioned large cardboard box. I had already built a website for Brompton's Cocktail; I simultaneously started building an online archive of whatever Transformers box art I could find under the moniker <a href="#/about/botch">"Botch"</a>. More importantly, I finally found a lifelong career that interested me, <a href="/images/about/adam/adam-alexander-resume-2017.pdf" target="resume">front-end web development</a>. Meanwhile, <a href="#/archive">Botch's Transformers Box Art Archive</a> (this site) has showcased Transformers box art online since 1998.</p>

    <p>My sixth lifelong love is <a href="https://www.instagram.com/dollfaceinthedark/" target="heather">Heather</a>, who I met in 1999 at a Brompton's Cocktail show. We courted, fell in love, moved in together, and after six years of romancing we finally got married in a private ceremony on Po'olenana Beach in Maui. She loves horror, cats, bookstores, restaurants, and me.</p>

    <p>In 2007, we packed up our cats and toys and moved across the country to Portland, Oregon. (I really like Portland, but it's not a love.) For a couple years I sang for an alternative rock band called <a href="https://idisagree.bandcamp.com/" target="">I Disagree</a>, but eventually I formed <a href="https://dielikegentlemen.com/" target="dlg">Die Like Gentlemen</a>, a rock/metal/sludge group that feels like my purest musical distillation of all the heavy, groovy, and progressive music that I enjoy and want to also embody.</p>

    <p>Heather has <a href="https://www.instagram.com/heatherliveswithcats/" target="cats">four cats</a> -- they're hers, not mine -- and has found her calling as a bookseller at Powell's Books. I continue to work as a web developer, collect toys, and when there isn't a pandemic, spend a lot of time playing and seeing live music.</p>

    <p>... and my collection of Transformers continues to grow.</p>

  	<p align="right" style="font-size:0.8em"><i>Last updated March 2021</i></p>

  </div>

</template>

<script>

  var globalService = require('services/global_service');

  module.exports = {

    mounted() {
      globalService.setOfficeDocumentTitle("Adam Alexander");
    }

  };

</script>
