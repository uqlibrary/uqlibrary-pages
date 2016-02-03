/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  //document.cookie="UQLMockData=enabled";

  // imports are loaded and elements have been registered
  window.addEventListener('WebComponentsReady', function(e) {

    //set up header required buttons and events
    var header = document.querySelector('uq-minimal-header');
    header.addEventListener('menu-clicked', function(e) {
      var menu = document.querySelector('uql-menu');
      menu.toggleMenu();
    });

    //setup footer/menu json
    //TODO: remove for deployment (it will come from vulcanized elements file in deployment)
    //var menuJson = {
    //  "heading": "Menu demo",
    //  "items": [
    //    {
    //      "label": "Library Services",
    //      "href": "/uql-mega-menu",
    //      "items": [
    //        {
    //          "label": "Your subject Librarian",
    //          "subtext": "Item subtext",
    //          "href": "/uql-mega-menu/demo/index.html"
    //        },
    //        {
    //          "label": "IT",
    //          "href": "/item2"
    //        },
    //        {
    //          "label": "Copyright advice",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "Digitisation",
    //          "subtext": "Specific categories below",
    //          "href": "/item1",
    //          "right": "right"
    //        },
    //        {
    //          "label": "for Students",
    //          "href": "/item2",
    //          "right": "right"
    //        },
    //        {
    //          "label": "for Researchers",
    //          "href": "/item2",
    //          "right": "right"
    //        },
    //        {
    //          "label": "for Teaching Staff",
    //          "href": "/item2",
    //          "right": "right"
    //        },
    //        {
    //          "label": "for Professional Staff",
    //          "href": "/item2",
    //          "right": "right"
    //        },
    //        {
    //          "label": "for Hospital Staff",
    //          "href": "/item2",
    //          "right": "right"
    //        },
    //        {
    //          "label": "for Alumni",
    //          "href": "/item2",
    //          "right": "right"
    //        },
    //        {
    //          "label": "for Community",
    //          "href": "/item2",
    //          "right": "right"
    //        },
    //        {
    //          "label": "for Secondary Schools",
    //          "href": "/item2",
    //          "right": "right"
    //        },
    //        {
    //          "label": "for Clients with disabilities",
    //          "href": "/item2",
    //          "right": "right"
    //        },
    //        {
    //          "label": "for Other Libraries Staff",
    //          "href": "/item2",
    //          "right": "right"
    //        }
    //      ]
    //    },
    //    {
    //      "label": "Research tools & techniques",
    //      "href": "",
    //      "items": [
    //        {
    //          "label": "Databases",
    //          "href": "/item1"
    //        },
    //        {
    //          "label": "Journals & newspapers",
    //          "href": "/item2",
    //          "subtext": "Item subtext"
    //        },
    //        {
    //          "label": "Catalogue",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "UQ eSpace",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "Research by subject",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "Search techniques",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "Evaluate your results",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "Referencing",
    //          "href": "/item1",
    //          "image": "demo.jpg",
    //          "subtext": "Images are nice",
    //          "right": "right"
    //        }
    //      ]
    //    },
    //    {
    //      "label": "Our Collections",
    //      "href": "",
    //      "items": [
    //        {
    //          "label": "Collection strengths",
    //          "href": "/item1"
    //        },
    //        {
    //          "label": "Online exhibitions",
    //          "href": "/item2",
    //          "subtext": "Item subtext"
    //        },
    //        {
    //          "label": "Cultural & historical collections",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "Collection development",
    //          "href": "/item3"
    //        }
    //      ]
    //    },
    //    {
    //      "label": "Borrowing & Requesting",
    //      "href": "",
    //      "items": [
    //        {
    //          "label": "How to borrow",
    //          "href": "/item1"
    //        },
    //        {
    //          "label": "Overdue items",
    //          "href": "/item2",
    //          "subtext": "Item subtext"
    //        },
    //        {
    //          "label": "View your loans",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "Renewing",
    //          "href": "/item3",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Accessing restricted materials",
    //          "subtext": "Item subtext",
    //          "href": "/item1",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Borrow & request from other libraries",
    //          "href": "/item2",
    //          "right": "right"
    //        }
    //      ]
    //    },
    //    {
    //      "label": "Locations & Hours",
    //      "href": "",
    //      "items": [
    //        {
    //          "label": "Opening hours",
    //          "href": "/item1"
    //        },
    //        {
    //          "label": "Room & desk booking",
    //          "href": "/item2",
    //          "subtext": "Item subtext"
    //        },
    //        {
    //          "label": "24/7 spaces",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "Biological Sciences",
    //          "href": "/item3",
    //          "right": "right"
    //        },
    //        {
    //          "label": "D.H. Engineering & Sciences",
    //          "href": "/item3",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Fryer",
    //          "href": "/item3",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Gatton",
    //          "href": "/item3",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Grad. Economics & Business",
    //          "href": "/item3",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Herston Health Sciences",
    //          "href": "/item3",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Law",
    //          "href": "/item3",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Mater",
    //          "href": "/item3",
    //          "right": "right"
    //        },
    //        {
    //          "label": "PACE Health Sciences",
    //          "href": "/item3",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Rural Clinical School",
    //          "href": "/item3",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Social Sciences & Humanities",
    //          "href": "/item3",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Warehouse",
    //          "href": "/item3",
    //          "right": "right"
    //        }
    //      ]
    //    },
    //    {
    //      "label": "About us",
    //      "href": "",
    //      "items": [
    //        {
    //          "label": "News",
    //          "href": "/item1"
    //        },
    //        {
    //          "label": "Events",
    //          "href": "/item2",
    //          "subtext": "Item subtext"
    //        },
    //        {
    //          "label": "Friends of the Library",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "Membership",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "History of the Library",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "Giving to the Library",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "Library tours",
    //          "href": "/item3"
    //        },
    //        {
    //          "label": "Organisational structure",
    //          "href": "/item3",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Policies & guidelines",
    //          "subtext": "Item subtext",
    //          "href": "/item1",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Reports & publications",
    //          "subtext": "Item subtext",
    //          "href": "/item1",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Employment",
    //          "subtext": "Item subtext",
    //          "href": "/item1",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Awards & competitions",
    //          "subtext": "Item subtext",
    //          "href": "/item1",
    //          "right": "right"
    //        },
    //        {
    //          "label": "Contacting us & feedback",
    //          "subtext": "Item subtext",
    //          "href": "/item1",
    //          "right": "right"
    //        }
    //      ]
    //    },
    //    {
    //      "label": "Ask us",
    //      "href": "/item1"
    //    }
    //  ]
    //};
    //
    //document.querySelector('uql-menu').menu = menuJson;
    //document.querySelector('uql-connect-footer').menu = menuJson;

  });

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  //var app = document.querySelector('#app');

  // Listen for template bound event to know when bindings
  // have resolved and content has been stamped to the page
  //app.addEventListener('dom-change', function() {
  //  console.log('Our app is ready to rock!');
  //});

})(document);
