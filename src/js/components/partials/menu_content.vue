<style>
  /* */
</style>

<template>

  <ul>
    <li v-for="item in menuStructure">
      <a v-bind:href="item.link" v-bind:target="item.external ? '_blank' : '_self'">
        <span v-if="item.menuIconId" class="menu_icon" v-bind:id="'menu_icon_' + item.menuIconId" v-html="item.text"></span>
        <span v-if="!item.menuIconId" v-html="item.text"></span>
      </a>

      <ul v-if="item.children">
        <li v-for="item in item.children">
          <a v-bind:href="item.link" v-bind:target="item.external ? '_blank' : '_self'">
            <span v-if="item.menuIconId" class="menu_icon" v-bind:id="'menu_icon_' + item.menuIconId" v-html="item.text"></span>
            <span v-if="!item.menuIconId" v-html="item.text"></span>
          </a>

          <ul v-if="item.children">
            <li v-for="item in item.children">
              <a v-bind:href="item.link" v-bind:target="item.external ? '_blank' : '_self'">
                <span v-if="item.menuIconId" class="menu_icon" v-bind:id="'menu_icon_' + item.menuIconId" v-html="item.text"></span>
                <span v-if="!item.menuIconId" v-html="item.text"></span>
              </a>
            </li>
          </ul>

        </li>
      </ul>

    </li>
  </ul>

</template>

<script>

  var factionYears = [
    {
      text: "1984",
      link: '#/archive/teletran/FACTION/1984'
    },
    {
      text: "1985",
      link: '#/archive/teletran/FACTION/1985'
    },
    {
      text: "1986",
      link: '#/archive/teletran/FACTION/1986'
    },
    {
      text: "1987",
      link: '#/archive/teletran/FACTION/1987'
    },
    {
      text: "1988",
      link: '#/archive/teletran/FACTION/1988'
    },
    {
      text: "1989",
      link: '#/archive/teletran/FACTION/1989'
    },
    {
      text: "1990",
      link: '#/archive/teletran/FACTION/1990'
    },
    {
      text: "Action Masters",
      link: '#/archive/teletran/FACTION/action_masters'
    },
    {
      text: "Japanese Exclusives",
      link: '#/archive/teletran/FACTION/japan'
    },
    {
      text: "European Exclusives",
      link: '#/archive/teletran/FACTION/europe'
    }
  ];

  var menuStructure = [
    {
      text: "Home",
      menuIconId: 'home',
      link: '#/'
    },
    {
      text: "Transformers <br/>Box Art Archive",
      menuIconId: 'archive',
      link: '#/archive',
      children: [
        {
          text: "Recent Updates"
        },
        {
          text: "Autobots",
          menuIconId: 'autobot',
          link: '#/archive/teletran/autobot',
          children: _.map(factionYears, function(year) {
            return {
              text: year.text,
              link: year.link.replace(/FACTION/g, 'autobot')
            }
          })
        },
        {
          text: "Decepticons",
          menuIconId: 'decepticon',
          link: '#/archive/teletran/decepticon',
          children: _.map(factionYears, function(year) {
            return {
              text: year.text,
              link: year.link.replace(/FACTION/g, 'decepticon')
            }
          })
        },
        {
          text: "Tech Specs",
          link: '#/archive/techspecs'
        },
        {
          text: "Instructions",
          link: '#/archive/instructions'
        },
        {
          text: "Back of the Box Art",
          link: '#/archive/boxbattles'
        },
        {
          text: "Catalogs",
          link: '#/archive/catalogs'
        },
        {
          text: "Reinforcements From Cybertron",
          link: '#/archive/reinforcements'
        },
        {
          text: "Box Art History",
          link: '#/archive/history'
        },
        {
          text: "Edit / Scan / Donate",
          link: '#/archive/help  '
        }
      ]
    },
    {
      text: "Music",
      menuIconId: 'music',
      link: '#/about/music'
    },
    {
      text: "More Galleries",
      link: '#/galleries'
    },
    {
      text: "About",
      link: '#/about',
      children: [
        {
          text: "Adam Alexander",
          link: '#/about/adam'
        },
        {
          text: "Botch the Crab",
          link: '#/about/botch'
        }
      ]
    },
    {
      text: "Browse Tags",
      link: '#/tags'
    },
    {
      text: "FAQ / Contact",
      link: '#/about/contact'
    },
    {
      text: "R&#0233;sum&#0233;",
      link: '/images/about/adam/adam-alexander-resume-2017.pdf',
      external: true
    }
  ];


  module.exports = {

    props: ['currentRoute'],

    data() {
      return {
        menuStructure: menuStructure,
        btcMenu: null
      }
    },

    mounted() {
      var vm = this;

      $(document).ready(function() {

        vm.btcMenu = new Mmenu('#menu', {
          navbar: {
            add: true,
            title: "Botch the Crab",
            titleLink: "none",
            sticky: false
          },
          onclick: {
            close: true,
            preventDefault: false,
            setSelected: true
          },
          slidingSubmenus: true,
          wrappers: [],
          extensions: [
            "position-front"
          ]
        }, {
          // configuration
          classNames: {
            selected: "menuItemSelected"
          }
        });

        var $menuContent = $('#menu');

        $menuContent.on('click', function($event) {
          var anchor = $event.target.closest('a[href^="#/"]')
          if (anchor && anchor.hash) {
            location.hash = anchor.hash;
            vm.btcMenu.API.close();
          }

        });

        // unhide
        $menuContent.css('visibility', 'visible');

        window.triggerMenuUpdate = vm.updateMenuSelection;

        // initial menu item selection
        var initialRoute = {
          path: location.hash.substring(1)
        };
        vm.updateMenuSelection(initialRoute);

      });

    },

    methods: {

      updateMenuSelection: function(currentRoute) {
        var vm = this;

        var path = currentRoute && currentRoute.path;

        if (!path) { return; }

        var $currentLink = $('#menu a[href="#' + currentRoute.path + '"]');
        if ($currentLink.length) {
          var $currentListItem = $currentLink.closest('li');
          if ($currentListItem && $currentListItem.length) {
            var $currentPanel = $currentListItem.closest('ul');
            vm.btcMenu.API.setSelected($currentListItem[0]);
            vm.btcMenu.API.openPanel($currentPanel[0]);
          }
        }
      }

    }

  };


</script>
