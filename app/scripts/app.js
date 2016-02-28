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

  document.cookie="UQLMockData=enabled";

  // imports are loaded and elements have been registered
  window.addEventListener('WebComponentsReady', function(e) {

    //set up header required buttons and events
    var header = document.querySelector('uq-minimal-header');
    header.addEventListener('menu-clicked', function(e) {
      var menu = document.querySelector('uql-menu');
      menu.toggleMenu();
    });
  });

  //// Grab a reference to our auto-binding template
  //// and give it some initial binding values
  //// Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var uqlFrontPage = document.querySelector('#uqlFrontPage');

  //// Listen for template bound event to know when bindings
  //// have resolved and content has been stamped to the page
  uqlFrontPage.addEventListener('dom-change', function() {

    //set sidebar tab default
    uqlFrontPage.selectedSidebarTab = 0;

    //set search card help links
    var search = Polymer.dom(document).querySelector("uqlibrary-search");
    uqlFrontPage.selectedSearchSource = search.selectedSource;

    search.addEventListener('selected-source-changed', function(e) {
      uqlFrontPage.selectedSearchSource = search.selectedSource;
    });
  });

})(document);
