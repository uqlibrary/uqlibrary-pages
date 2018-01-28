/**
 * this page takes an url on S3 like
 * http://files.library.uq.edu.au/file/secure/exams/0001/3e201.pdf
 * and returns a web page with a clickable link to the s3 encoded url
 * (or various errors messages)
 */

(function(document) {
  'use strict';

      var isValidRequest = true;
      var pathProperties = [];
      var collectionType = '';
      var filePath = '';
      var copyrightAccepted = '';
      var pageHeader = '';

  // method : {
  //   type: String,
  //   value: ''
  // },


      pathProperties = [
        {
          name: 'pdf',
          oldPHP: '/coursebank/get.php',
          oldFileLocation: '/coursematerials/coursebank/', // unused? , included for transparency
          urlPath: '/collection/pdf/get/', // unused? , included for transparency
          collection: 'pdf',
          isOpenaccess: false,
          isDownloadForced: true/false
        },
        {
          name: 'exams',
          oldPHP: 'pdfserve.php',
          oldFileLocation: '/coursematerials/exams/',
          urlPath: '/collection/exams/get/',
          collection: 'exams',
          isOpenaccess: false,
          isDownloadForced: true/false
        },
        { // default
          name: 'coursematerials',
          oldPHP: 'eget.php', // ???
          oldFileLocation: '/coursematerials/',
          urlPath: '/collection/coursematerials/',
          collection: 'coursematerials',
          isOpenaccess: true,
          isDownloadForced: true/false
        },
        {
          name: 'cdbooks',
          oldPHP: 'acdb.php',
          oldFileLocation: '/cdbooks/',
          urlPath: '/collection/acdb/',
          collection: 'cdbooks',
          fileId: 'rid',
          isOpenaccess: false,
          isDownloadForced: true/false
        },
        {
          name: 'doc',
          oldPHP: 'pdfget.php',
          oldFileLocation: '/uqdocserv/',
          urlPath: '/collection/doc/',
          collection: 'doc',
          fileId: 'image',
          isOpenaccess: true,
          isDownloadForced: true/false
        },
        {
          name: 'software',
          oldPHP: 'swget.php',
          oldFileLocation: '/uqsoftserv/',
          urlPath: '/collection/software/',
          collection: 'software',
          isOpenaccess: false,
          isDownloadForced: true/false
        },
        {
          name: 'bom',
          oldPHP: 'bom.php',
          oldFileLocation: '/bom/',
          urlPath: '/collection/bom/',
          validMethods: [ 'list' ],
          collection: 'bom',
          pageHeader: 'Bureau of Meteorology - Climate Data',
          // pageSubheader: 'Bureau of Meteorology - Climate Data',
          content: 'Access to files in these datasets is restricted to UQ users.',
          isDownloadForced: true/false,
          isOpenaccess: true // but special access
        },
        {
          name: 'thomson',
          oldPHP: 'thomson',
          oldFileLocation: '/thomson/',
          urlPath: '/collection/thomson/',
          collection: 'thomson',
          validMethods: ['list'],
          isDownloadForced: true / false,
          isOpenaccess: true, // but special access
          pageHeader: 'Thomson Reuters Collections'
        }
      ];

      collectionType = getVariableFromUrlParameter('collection');
      filePath = getVariableFromUrlParameter('file');
      // this.method = getVariableFromUrlParameter('method');
console.log('end attached');


console.log('start ready');
      var browserData = browserSupported();

      if (!browserData.supported) {
        if (document.getElementById('preloader-unsupported'))
          document.getElementById('preloader-unsupported').style.display = 'block';
      } else {
        if(document.getElementById('preloader-loading')) {
          document.getElementById('preloader-loading').style.display = 'block';
        }
      }

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
    var header = document.querySelector('uq-minimal-header');
    if (header) {
      header.addEventListener('menu-clicked', function (e) {
        var menu = document.querySelector('uql-menu');
        menu.toggleMenu();
      });
    }

    // GA events
// ask Nick about GA
// ga = document.querySelector('#home-ga');
// // record page view
// ga.addPageView('');
  });

  // var acceptCopyrightButton = document.querySelector('#acceptCopyrightButton');
  // if (typeof(acceptCopyrightButton) !== 'undefined' && acceptCopyrightButton) {
  //   //// Listen for template bound event to know when bindings
  //   //// have resolved and content has been stamped to the page
  //   acceptCopyrightButton.addEventListener('dom-change', function () {
  //   });
  // }

  var app = document.querySelector('#documentDownload');
console.log(app);
  var collection = loadCollectionDetail(collectionType, pathProperties);
  if (false === collection) {
    app.pageHeader = 'Invalid file location';
console.log('app.pageHeader = ' + app.pageHeader);
  } else {
console.log('collection ok');
  }

  var acceptCopyrightLink = '';
  var isRedirect = false;
  app.deliveryFilename = '';
  isValidRequest = true; // default

      // app.isValidRequest = _isValidRequest(collectionType);

  if (true) { //app.isValidRequest) {
    var linkToEncode = collectionType + filePath;
console.log('linkToEncode = '+linkToEncode);
console.log('about to get');
    this.$.encodedUrlApi.get({plainUrl: linkToEncode});

    if (collection.isOpenaccess === true) {
console.log('collection.isOpenaccess === true');
      isRedirect = true;
    } else {
console.log('collection.isOpenaccess NOT true');
      if (copyrightAcknowledged()) {
        // they have acknowledged copyright
        isRedirect = true;
      } else {
        // displaying this link on the web page will come later
//         acceptCopyrightLink = 'http://files.library.uq.edu.au/' + collectionType + '/' + method + '/acceptCopyright' + '/' + linkToEncode;
        // get an aws keyed url from api/files

      }
    }


    var self = this;
    app.addEventListener('uqlibrary-api-collection-encoded-url', function (e) {
console.log(e);
      if (e.detail.url) {
        self.clickableLink = e.detail.url;
console.log('self.clickableLink: ' + self.clickableLink);
        app.deliveryFilename = self.clickableLink; //that doesnt make sense! Its not asynchronous!
      }
    });
    // this.$.list.addEventListener('uqlibrary-api', function (e) {
    //   self.list = e.detail;
    //   self.fire('uqlibrary-api-collection-encoded-url', self.list);
    // });


    var fileList = [];
    // thomson and bom supply a list page
    if (method === 'list') {
      // list: tbd
      // get an aws keyed url from api/files
      // if ( !preg_match('/^(apps|lectures|sustainable_tourism)/', fileid) ) {
      //   set this.isValidRequest = false
      // }
      // vary deliver on method = get/serve
      fileList = 'something'; // replace with aws thingy
      // then display on page as list
    } else {
      // if ( !preg_match('/^(apps|lectures|sustainable_tourism)/', fileid) ) {
      //   set this.isValidRequest = false
      // }
      // vary deliver on method = get/serve
      app.deliveryFilename = clickableLink; // replace with aws thingy
      // get encoded file name from api
      // if cant find file (receive false?)
      //    set this.isValidRequest = false
    }
  }


if (isRedirect) {
    // if eg file was openaccess, redirect to desired url
    window.location.href = app.deliveryFilename;
  }

  function copyrightAcknowledged() {
    copyrightAccepted = getVariableFromUrlParameter('copyright');
    return (copyrightAccepted !== false);
  }

  function encodeUrlLoaded(e) {
console.log(e.detail);

    }

  function _isValidRequest(collectionType) {
    console.log('in _isValidRequest');

    var requestedUrl = '';


    var subcollectionName = '';
    var hasSubcollection = false;
    if (collectionType === 'thomson') { // also bom?
      hasSubcollection = true;
    }

    // collection = loadCollectionDetail(collectionType);



    // valid values for method can be 'get' or 'serve' for general collection types, or 'list' for thomson & bom
    // it is also overloaded as {collection name} for thomson
// I dont think we need this - S3 is looking after get/serve. or is just going to be list?
    if (method === false) {
      method = 'serve';
    }
    if (hasSubcollection) {
      subcollectionName = method;
      method = 'serve';
    } else {
      // if (collection.validMethods.indexOf(method) === -1) {
      //   // invalid method found
      //   isValidRequest = false
      // }
    }

    return isValidRequest;
  }

  /*
  _showList: function () {
    this._switchToPage(0);
    this.fire('show-list');
  },
  */
  function getVariableFromUrlParameter (variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split("=");
      if (pair[0] === variable) {
console.log('getVariableFromUrlParameter: ' + variable + ' = ' + pair[1]);
        return pair[1];
      }
    }
console.log('getVariableFromUrlParameter: ' + variable + 'not found');
    return false;
  }

  function loadCollectionDetail (collectionType, pathProperties) {
    var collection = false;
console.log('collectionType = ' + collectionType);

    collection = pathProperties.filter(function (e) {
      return collectionType === e.name;
    });

    if (collection) {
console.log('returning collection:', collection[0]);
      return collection[0];
    } else {
console.log('collectionType not found');
      return false;
    }
  }


})(document);

