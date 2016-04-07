var browserData = browserSupported();

if (!browserData.supported) {
  if (document.getElementById('preloader-unsupported'))
    document.getElementById('preloader-unsupported').style.display = 'block';
} else {
  if(document.getElementById('preloader-loading')) {
    document.getElementById('preloader-loading').style.display = 'block';
  }
}

(function(document) {
  'use strict';

  // imports are loaded and elements have been registered
  window.addEventListener('WebComponentsReady', function(e) {

    //only display unsupported big message if web components can't be loaded
    if (document.getElementById('preloader-unsupported'))
      document.getElementById('preloader-unsupported').style.display = 'none';

    if (document.querySelector('#preloader-loading'))
      document.querySelector('#preloader-loading').style.display = 'none';

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

    // Add GA events to the sidebar tabs
    var ga = document.querySelector('#home-ga');
    var uqlSidebar = document.querySelector('#sidebar-tabs');
    uqlSidebar.addEventListener('iron-select', function (e) {
      ga.addEvent('Navigation', 'Sidebar tab ' + e.detail.item.innerText.toLowerCase());
    });
  });

})(document);