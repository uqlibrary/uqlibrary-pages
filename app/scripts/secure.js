/*
  method:
  1. page loads with a whirlyball
  2. if the file request is complete (it is valid and either open access or they have accepted copyright), they get redirected
  3. if not (needs copyright ok, file doesnt exist, etc) the appropriate page element will load/appear

  The intial pass of this is ONLY serving files
  some of the coding is done for 'supply a list of files on a web page'
  but its not yet being used (or even finished)
 */
console.log('start');
var browserData = browserSupported();

if (!browserData.supported) {
  if (document.getElementById('preloader-unsupported'))
    document.getElementById('preloader-unsupported').style.display = 'block';
} else {
  if(document.getElementById('preloader-loading')) {
    document.getElementById('preloader-loading').style.display = 'block';
  }
}

/*
    assume a keyword of 'collection' (this can be changed in the design phase)
    url calls come through haproxy, which makes these changes to requested urls, eg:

      http://files.library.uq.edu.au/collection/thomson/${collectionName}/xxx
    into
      http://api.library.uq.edu.au/secure/index.html?collection=thomson&method=${collectionName}&file=xxx

    and
      http://files.library.uq.edu.au/collection/bom/${collectionName}/xxx
    into
      http://api.library.uq.edu.au/secure/index.html?collection=bom&method=${collectionName}&file=xxx

    and
      http://files.library.uq.edu.au/collection/{other}/xxx
    into
      http://api.library.uq.edu.au/secure/index.html?collection={other}&file=xxx


    ** SPECIAL - no filename! (later)
      http://files.library.uq.edu.au/collection/thomson/${collectionName}/list
    into
      http://files.library.uq.edu.au/secure/index.html?collection=thomson&subcollection=${collectionName}&method=list
    and
      http://files.library.uq.edu.au/collection/bom/list
    into
      http://files.library.uq.edu.au/secure/index.html?collection=bom&method=list




    with fallback:
      http://files.library.uq.edu.au/collection/xxx/yyy
    into
      http://files.library.uq.edu.au/secure/index.html?collection=yyy&file=xxx
    eg
      http://files.library.uq.edu.au/collection/acdb/Britain%20-%20Scotland%20-%20Europe%2FBRA018%20Nottingham.pdf
    into
      http://files.library.uq.edu.au/secure/index.html?collection=cdbooks&file=Britain%20-%20Scotland%20-%20Europe%2FBRA018%20Nottingham.pdf



    SO! haProxy redirects would be:
    http://files.library.uq.edu.au/secure/xxx/zzz
    => http://files.library.uq.edu.au/secure/?collection=xxx&file=zzz

    http://files.library.uq.edu.au/secure/collection/xxx/zzz
    => http://files.library.uq.edu.au/secure/?collection=xxx&file=zzz // method is implied, serve

    http://files.library.uq.edu.au/collection/xxx/bbb/list // not needed yet
    => http://files.library.uq.edu.au/secure/index.html?collection=xxx&subcollection=bbb&method=list
    eg http://files.library.uq.edu.au/collection/thomson/class_legal_tests/list

    eg https://files.library.uq.edu.au/thomson/classic_legal_texts/Thynne_Accountability_And_Control.pdf
    http://files.library.uq.edu.au/collection/thomson/bbb/zzz // not needed yet
    => http://api.library.uq.edu.au/v1/files/collection=thomson&subcollection=bbb&file=zzz

    http://files.library.uq.edu.au/collection/bom/bbb/list // not needed yet
    => http://files.library.uq.edu.au/secure/index.html?collection=xxx&subcollection=bbb&method=list
    eg http://files.library.uq.edu.au/collection/bom/class_legal_tests/list

    eg http://files.library.uq.edu.au/collection/bom/{subcollection}/file.pdf // does bom have subcollections?
    http://files.library.uq.edu.au/collection/bom/bbb/zzz // not needed yet
    => http://api.library.uq.edu.au/v1/files/collection=bom&subcollection=bbb&file=zzz

    http://files.library.uq.edu.au/collection/xxx/yyy/zzz
    => http://files.library.uq.edu.au/secure/index.html?collection=xxx&method=yyy&file=zzz

    http://files.library.uq.edu.au/secure/xxx/zzz
    => http://files.library.uq.edu.au/secure/index.html?collection=xxx&file=zzz

    ie xxx = collection type
       yyy = method type (get, serve, list) [defaults to serve]
       zzz = file id


bbb = subcollection name
old path => can haproxy redirect to => final url (usually non public)
(redirection might be easiest to do in the old .php files)
    https://coursebank.library.uq.edu.au/?id=zzz (current url)
    https://www.library.uq.edu.au/coursebank/get.php?id=zzz (current url)
      => https://files.library.uq.edu.au/collection/coursebank/zzz
              => http://api.library.uq.edu.au/v1/files/collection/coursebank/zzz
              => returns s3 encoded url

    https://www.library.uq.edu.au/acdb.php?id=zzz (current url)
      => https://files.library.uq.edu.au/collection/cdbooks/zzz => http://api.library.uq.edu.au/v1/files/collection/cdbooks/zzz

    https://www.library.uq.edu.au/swget.php?rid=zzz (current url)
    https://www.library.uq.edu.au/swget.php?id=zzz (current url)
      => https://files.library.uq.edu.au/collection/cdbooks/zzz => http://api.library.uq.edu.au/v1/files/collection/cdbooks/zzz

    https://www.library.uq.edu.au/pdfget.php?rid=zzz.pdf (current url)
      => https://files.library.uq.edu.au/secure/doc/zzz.pdf
                => http://files.library.uq.edu.au/secure/?collection=doc&file=zzz.pdf
                => loads uqlibrary-pages secure/index.html?collection=doc&file=zzz.pdf
                => which calls uqlibrary-api uqlibrary-api-collection-encoded-url
                => which calls http://api.library.uq.edu.au/v1/files/collection/doc/zzz.pdf?copyright
                   which knows that 'doc/' files are copyrighted
                   if '?copyright' not found => returns https://files.library.uq.edu.au/secure/doc/zzz.pdf
                   else returns an s3 encoded url

    https://www.library.uq.edu.au/pdfserve.php?rid=zzz (current url)
      => https://files.library.uq.edu.au/secure/exams/zzz => http://files.library.uq.edu.au/secure/?collection=exams&file=zzz

    https://www.library.uq.edu.au/thomson.php?collection=bbb&id=zzz (current url)
      => http://files.library.uq.edu.au/collection/thomson/bbb/zzz => http://api.library.uq.edu.au/v1/files/collection/thomson/bbb/zzz

    // list view (FUTURE!!!)
    https://www.library.uq.edu.au/thomson.php?collection=bbb&id=list
        => http://files.library.uq.edu.au/collection/thomson/bbb (future)

    https://www.library.uq.edu.au/bomdata.php?collection=bbb&id=zzz (current url)
        => http://files.library.uq.edu.au/collection/bom/bbb/zzz => http://api.library.uq.edu.au/v1/files/collection/bom/bbb/zzz

    // list view (FUTURE!!!)
    https://www.library.uq.edu.au/bomdata.php?collection=bbb
        => http://files.library.uq.edu.au/collection/bom/bbb (future)

    // are these 3 sets all only eget.php???
    https://www.library.uq.edu.au/(.*)?id=apps(.*) (current url)
     => https://files.library.uq.edu.au/collection/pdf/apps$1 => http://api.library.uq.edu.au/v1/files/collection/pdf/apps$1

    https://www.library.uq.edu.au/(.*)?id=lectures(.*) (current url)
    https://www.library.uq.edu.au/coursematerials/lectures(.*) (current url)
      => https://files.library.uq.edu.au/collection/pdf/lectures$1 => http://api.library.uq.edu.au/v1/files/collection/pdf/lectures$1

    https://www.library.uq.edu.au/(.*)?id=sustainable_tourism(.*) (current url)
    https://www.library.uq.edu.au/coursematerials/sustainable_tourism(.*) (current url)
      => https://files.library.uq.edu.au/collection/pdf/sustainable_tourism$1 => http://api.library.uq.edu.au/v1/files/collection/pdf/sustainable_tourism$1



    // general / fallback
    http://files.library.uq.edu.au/secure/xxx/zzz =>
        http://files.library.uq.edu.au/secure/?collection=xxx&file=zzz => (webpage presents return from call to api: http://api.library.uq.edu.au/v1/files/collection/xxx/zzz?copyright )
    http://files.library.uq.edu.au/collection/xxx/bbb/zzz =>
        http://api.library.uq.edu.au/v1/files/collection/xxx/bbb/zzz
    http://files.library.uq.edu.au/collection/xxx/zzz =>
        http://api.library.uq.edu.au/v1/files/collection/xxx/zzz
 */

var pathProperties = [
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


(function(document) {
  'use strict';

  var ga;

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

  var acceptCopyrightLink = '';
  var isRedirect = false;
  documentDownloadPage.deliveryFilename = '';
  if (_isValidRequest(pathProperties)) {
    var linkToEncode = getVariableFromUrlParameter('file');
    var collectionType = getVariableFromUrlParameter('collection');

    if (collection.isOpenaccess === true) {
      console.log('collection.isOpenaccess === true');
      isRedirect = true;
    } else {
      console.log('collection.isOpenaccess NOT true');
      var copyrightAccepted = getVariableFromUrlParameter('copyright');
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
    this.$.encodedUrlApi.addEventListener('uqlibrary-api-collection-encoded-url', function(e) {
console.log(e);
      if (e.detail.url) {
        self.clickableLink = e.detail.url;
      }
    });
    documentDownloadPage.deliveryFilename = this.clickableLink; //that doesnt make sense! Its not asynchronous!

    var fileList = [];
    // thomson and bom supply a list page
    if (method === 'list') {
      // list: tbd
      // get an aws keyed url from api/files
      // if ( !preg_match('/^(apps|lectures|sustainable_tourism)/', fileid) ) {
      //   set isValidRequest = false
      // }
      // vary deliver on method = get/serve
      fileList = 'something'; // replace with aws thingy
      // then display on page as list
    } else {
      // if ( !preg_match('/^(apps|lectures|sustainable_tourism)/', fileid) ) {
      //   set isValidRequest = false
      // }
      // vary deliver on method = get/serve
      documentDownloadPage.deliveryFilename = clickableLink; // replace with aws thingy
      // get encoded file name from api
      // if cant find file (receive false?)
      //    set isValidRequest = false
    }
  }


  if (isRedirect) {
    // if eg file was openaccess, redirect to desired url
    window.location.href = documentDownloadPage.deliveryFilename;
  }




})(document);

function _isValidRequest(pathProperties) {
console.log('in _isValidRequest');
console.log(pathProperties);
  var isValidRequest = true;

  var requestedUrl = '';

  var collectionType = getVariableFromUrlParameter('collection');

  var subcollectionName = '';
  var hasSubcollection = false;
  if (collectionType === 'thomson') { // also bom?
    hasSubcollection = true;
  }

  collection = loadDetails(collectionType, pathProperties);
  // if (collectionType !== false && pathProperties.indexOf(collectionType) !== -1) {
  //   collection = pathProperties[collectionType];
  // }

  // if (pathProperties[collectionType].indexOf('pageHeader') === -1) {
  //   collection['pageHeader'] = 'File Download'
  // }

  // valid values for method can be 'get' or 'serve' for general collection types, or 'list' for thomson & bom
  // it is also overloaded as {collection name} for thomson
// I dont think we need this - S3 is looking after get/serve. or is just going to be list?
  var method = getVariableFromUrlParameter('method');
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

function loadDetails(collectionType, pathProperties) {
  var collection = false;
console.log('collectionType = ' + collectionType);

  collection = pathProperties.filter(function (e) {
    return collectionType === e.name;
  });

if (collection) {
  console.log(collection);
} else {
  console.log('collectionType not found');
}
  return collection[0];
}