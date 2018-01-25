/**
 * this page takes an url on S3 like
 * http://files.library.uq.edu.au/file/secure/exams/0001/3e201.pdf
 * and returns a web page with a clickable link to the s3 encoded url
 * (or various errors messages)
 */
// 'use strict';

  Polymer({
    is: 'secure-page',

    properties: {
      isValidRequest: {
        type: Boolean,
        value: true
      },

      pathProperties: {
        type: Array
      },

      collectionType : {
        type: String,
        value: ''
      },

      filePath : {
        type: String,
        value: ''
      },

      // method : {
      //   type: String,
      //   value: ''
      // },

      copyrightAccepted : {
        type: String,
        value: ''
      },

      pageHeader: {
        type: String,
        value: ''
      }
    },

    attached: function() {
console.log('start attached');
      this.pathProperties = [
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

      this.collectionType = this.getVariableFromUrlParameter('collection');
      this.filePath = this.getVariableFromUrlParameter('file');
      this.copyrightAccepted = this.getVariableFromUrlParameter('copyright');
      // this.method = this.getVariableFromUrlParameter('method');
console.log('end attached');
    },

    ready: function() {
console.log('ready');
    },

    ready1: function() {
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

  var documentDownloadPage = document.querySelector('#documentDownload');
console.log(documentDownloadPage);
  this.collection = this.loadCollectionDetail(collectionType);
  if (false === this.collection) {
    documentDownloadPage.pageHeader = 'Invalid file location';
console.log('documentDownloadPage.pageHeader = ' + documentDownloadPage.pageHeader);
  } else {
console.log('collection ok');
  }

  var acceptCopyrightLink = '';
  var isRedirect = false;
  documentDownloadPage.deliveryFilename = '';
  this.isValidRequest = true; // default

      // documentDownloadPage.isValidRequest = this._isValidRequest();

  if (true) { //documentDownloadPage.isValidRequest) {
    var linkToEncode = this.collectionType + "/" + this.filePath;

console.log('about to get');
    this.$.encodedUrlApi.get({plainUrl: linkToEncode});

    if (collection.isOpenaccess === true) {
console.log('collection.isOpenaccess === true');
      isRedirect = true;
    } else {
console.log('collection.isOpenaccess NOT true');
      if (copyrightAccepted === 'proceed') {
        // they have acknowledged copyright
        isRedirect = true;
      } else {
        // displaying this link on the web page will come later
//         acceptCopyrightLink = 'http://files.library.uq.edu.au/' + collectionType + '/' + method + '/acceptCopyright' + '/' + linkToEncode;
        // get an aws keyed url from api/files

      }
    }


    var self = this;
//     this.$.encodedUrlApi.addEventListener('uqlibrary-api-collection-encoded-url', function (e) {
//       console.log(e);
//       if (e.detail.url) {
//         self.clickableLink = e.detail.url;
// console.log('self.clickableLink: ' + self.clickableLink);
//       }
//     });
    this.$.list.addEventListener('uqlibrary-api', function (e) {
      self.list = e.detail;
      self.fire('uqlibrary-api-collection-encoded-url', self.list);
    });


    documentDownloadPage.deliveryFilename = this.clickableLink; //that doesnt make sense! Its not asynchronous!

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
      documentDownloadPage.deliveryFilename = clickableLink; // replace with aws thingy
      // get encoded file name from api
      // if cant find file (receive false?)
      //    set this.isValidRequest = false
    }
  }


if (isRedirect) {
    // if eg file was openaccess, redirect to desired url
    window.location.href = documentDownloadPage.deliveryFilename;
  }
},

    encodeUrlLoaded: function(e) {
console.log(e.detail);

    },

   _isValidRequest: function() {
    console.log('in _isValidRequest');
    console.log(this.pathProperties);

    var requestedUrl = '';


    var subcollectionName = '';
    var hasSubcollection = false;
    if (collectionType === 'thomson') { // also bom?
      hasSubcollection = true;
    }

    // this.collection = this.loadCollectionDetail(collectionType);



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
      //   this.isValidRequest = false
      // }
    }

    return this.isValidRequest;
  },

  /*
  _showList: function () {
    this._switchToPage(0);
    this.fire('show-list');
  },
  */
   getVariableFromUrlParameter: function(variable) {
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
  },

  loadCollectionDetail: function(collectionType) {
    var collection = false;
    console.log('collectionType = ' + collectionType);

    collection = this.pathProperties.filter(function (e) {
      return collectionType === e.name;
    });

    if (collection) {
      console.log(collection);
      return collection[0];
    } else {
      console.log('collectionType not found');
      return false;
    }
  }
});


//})(document);

