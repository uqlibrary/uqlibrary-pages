/**
 * this page takes an url on S3 like
 * http://files.library.uq.edu.au/file/secure/exams/0001/3e201.pdf
 * and returns a web page with a clickable link to the s3 encoded url
 * (or various errors messages)
 */

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

  var app = document.querySelector('#app');
  var ga;

  // imports are loaded and elements have been registered
  window.addEventListener('WebComponentsReady', function (e) {

  //only display unsupported big message if web components can't be loaded
  if (document.getElementById('preloader-unsupported')) {
    document.getElementById('preloader-unsupported').style.display = 'none';
  }

  if (document.querySelector('#preloader-loading')) {
    document.querySelector('#preloader-loading').style.display = 'none';
  }

  //set up header required buttons and events
  // var header = document.querySelector('uq-minimal-header');
  // if (header) {
  //   header.addEventListener('menu-clicked', function (e) {
  //     var menu = document.querySelector('uql-menu');
  //     menu.toggleMenu();
  //   });
  // }

  window.addEventListener('uqlibrary-api-account-loaded', function (e) {
    if (e.detail.hasSession) {
      if (document.getElementById('preloader'))
        document.getElementById('preloader').style.display = 'none';
    } else {
      app.$.accountApi.login(document.location.href);
    }
  });

    // GA events
// ask Nick about GA
// ga = document.querySelector('#home-ga');
// // record page view
// ga.addPageView('');
});

})(document);
