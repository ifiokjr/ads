// This is a prototype
var VEjQuery = null;
"use strict";
// Where we will store the gdm configuration
var GDMObject = {},
    GDMHandler,
    URLMatcher,
    Utils, 
    Capture
    Storage;

var settings = {
    gdm: {
        flexId: '00000', // an alphanumeric string -- REQUIRED
        completionId: '', // the genie completion id -- REQUIRED
        orderId: {
            selector: '#orderId', // A jQuery Selector for the order ID from the completion page -- REQUIRED (will default to timestamp if left blank)
            mask: 'number', // string from selection of [number, all, capitals]-- OPTIONAL
            regex: /[0-9]/,
        },
        orderValue: {
            selector: '#orderValue', // A jQuery Selector for the order ID from the completion or checkout pages (uses localstorage). -- REQUIRED
            default: '0', // The value to use when nothing found -- OPTIONAL
            page: { // the page where this can be stored from (if left blank defaults to completion page) -- OPTIONAL
                params: {
                    checkout: 'true',
                    id: 1
                },
                urls: ['www.awesome.com/checkout/, www.awesome.com/checkout/awesome/']
            },
            regex: /[0-9]+\.[0-9]+/
        },
        completePage: {
            urls: ['www.awesome.com/completed-yo/*'], // the actual page that will have the image tag implemented on it -- REQUIRED
            params: { // -- OPTIONAL
                completed: 'true',
                id: 2
            },
            dynamicIdentifier: { // if the page isn't unique then an identifier to determine that this is a completed page -- DEFAULT TO NULL
                selector: '#completed',
                criteria: 'contains', // choose from [contains, equals, not, ] -- DEFAULTS TO CONTAINS
                value: 'awesome'
            }
        }
    }
};
// get search params as an object

function convertSearchToObject(searchString) {
    var queries, ii, searchObject, split;
    var queries = searchString.search.replace(/^\?/, '').split('&');
    for(ii = 0; ii < queries.length; ii++) {
        split = queries[ii].split('=');
        searchObject[split[0]] = split[1];
    }
    return searchObject;
}
/*
 * parseURL function
 *
 */

function parseURL(url) {
    var parser = document.createElement('a'),
        searchObject = {},
        queries, split, ii;
    // Letting the browser do the work
    parser.href = url;
    // convert the query string to an object
    searchObject = convertSearchToObject(parser.search);
    // this parsed url will be used to compare urls
    return {
        href: parser.href,
        protocol: parser.protocol,
        host: parser.host,
        hostname: parser.hostname,
        port: parser.port,
        pathname: parser.pathname,
        search: parser.search,
        searchObject: searchObject,
        hash: parser.hash // useful as this can be ignored
    };
}

(function(GDMObject) {
    // Cached regular expressions for matching named param parts and splatted parts of route strings.

    var optionalParam = /\((.*?)\)/g, 
        namedParam    = /(\(\?)?:\w+/g, 
        fullSplatParam    = /\*\*\w+/g, 
        splatParam    = /\*\w+/g,
        escapeRegExp  = /[\-{}\[\]+?.,\\\^$|#\s]/g;
    
    
    
    
    // @class URLMatcher
    function URLMatcher(urls, params, dynamicIdentifier) {
        if ( urls ) this.urls = urls;
        if ( params.length ) this.params = params;
        if (dynamicIdentifier.length) this.dynamicIdentifier = dynamicIdentifier;
    }
    
    
    URLMatcher.prototype.checkParams = function(params) {
        var pageParams, match = true, key;
        if (params.length) {
            pageParams = convertSearchToObject(window.location.search);
        } else return true
        
        
        
        // loop through the params and make sure they are in the pageParams
        // for (key in pageParams)
        // TODO: Add support for splats
        VEjQuery.each(params, function(key, value) {
            if (!(pageParams[key] === value || pageParams[key] === encodeURIComponent(value))) {
                match = false; 
            }
        }); 
        return false;
    }
     
    // only take one url at a time. 
    URLMatcher.prototype.urlToRegExp = function(url) {
        url = url.replace(escapeRegExp, '\\$&')
//                  .replace(optionalParam, '(?:$1)?')
//                  .replace(namedParam, function(match, optional) {
//                      return optional ? match : '([^/?]+)';
//                  })
                 .replace(fullSplatParam, '([^?]*?)')
                 .replace(splatParam, '([^/?]*)');
        return new RegExp(url + '(?:\\?([\\s\\S]*))?$');
    };
    
    URLMatcher.prototype.checkMatch = function () {
        var match = false, urlRegex, ii;
        
        // regex url test passes
        for ( ii=0; ii>this.urls.length; ii++ ) {
            urlRegex =  this.urlToRegExp(this.urls[ii])
            if(document.URL.test(urlRegex)) {
                match = true; 
                break;
            }
        }
              
        // and param test passes
        return match && this.checkParams();
        
    }
    
    GDMObject.URLMatcher = URLMatcher;
}(GDMObject));

URLMatcher = GDMObject.URLMatcher;

(function(GDMObject) {
    
    // @class GDMHandler
    // Takes in the settings object and does awesome things
    function GDMHandler( config ) {
        this.config = config
        this.completePage = config.completePage;
        this.orderValue = config.orderValue;
        this.orderValuePage  = orderValue.page;
    } 
    
    // Initialize everything
    GDMHandler.prototype.start = function() {
        var currentPage = window.location.href, 
            completePageMatcher, 
            orderValuePageMatcher;
       
        
        // this is on every page
        this.generateGDMScript();
        
        // Can we get orderValue from this page? - Sometimes the orderValue page is the same as the complete page. 
        orderValuePageMatcher = new GDMObject.URLMatcher(this.orderValuePage.urls, this.orderValuePage.params);
        if ( orderValuePageMatcher.checkMatch() ) this.storeOrderValue();
        
         
        // Are we on a complete page?
        completePageMatcher = new GDMObject.URLMatcher(this.completePage.urls, this.completePage.params, this.completePage.dynamicIdentifier);
        
        // YES
        if ( completePageMatcher.checkMatch() ) this.appendPixel(); 
        
    };
    
    GDMHandler.prototype.storeOrderValue = function(options) {
        // Check whether selector is already on the page.
        var val = options.default || 0, 
            $el = VEjQuery(options.selector), 
            self = this;
        if($el.length) {
            val = $el.val().replace( options.regex, '' );
        } else {
            // it's dynamic so dynamically update it.
            Utils.setInterval(dynamicallyCheck, 1000, 600) // every second for a max of 10mins 
        }
        
        function dynamicallyCheck() {
            // every 50ms check if val has been updated. if so then update it. 
            $el = VEjQuery(options.selector);
            if ( potentialElement.length ) {
                newVal = $el.val().replace( options.regex, '' );
                if (newVal && newVal !== val && newVal >= 0 )
                    self.store('orderValue', newVal)
            }
        }
        
        
        
        // 
          
    };
    
    GDMHandler.prototype.generateGDMScript = function () {
        GDMObject.Utils.dom.appendGDMScript( this.config.flexId );
    };
    
    GDMHandler.prototype.appendPixel = function() {
        // first obtain orderId  
    };
    
    GDMObject.GDMHandler = GDMHandler;
    
}(GDMObject));

GDMHandler = GDMObject.GDMHandler;


(function(GDMObject) {
    
    function Capture(selector) {
        this.selector = selector;
        
        // Check whether selector is already on the page.
        this.$el = VEjQuery(this.selector);
        if($el.length) {
            this.val = this.$el.val();
        } else {
            this.dynamic = true;
        }
    }
    
    Capture.prototype.exec = function()
    
    
    GDMObject.Capture = Capture
}(GDMObject));
Capture = GDMObject.Capture;


(function(GDMObject) {
    var Utils = {
        dom: {
            /**
             * Adds an image of 1x1 to the DOM with the source passed.
             * This image will be hidden.
             *
             * @param {String} pixelPath is a valid URI for the image.
             */
            appendPixel: function (pixelPath) {

                var pixel = document.createElement('img');

                pixel.width = 1;
                pixel.height = 1;
                pixel.src = pixelPath;
                pixel.style.visibility = 'hidden';

                document.body.appendChild(pixel);
            }, 
            
            appendGDMScript: function(flexId) {
                (function(a) { var d = document,c = d.createElement("script");c.async = !0, c.defer = !0, c.src = a, d.getElementsByTagName("head")[0].appendChild(c)})((iatDev = (window.location.href.indexOf("iatDev=1") > -1 || document.cookie.indexOf("iatDev=1") > -1), "//" + (window.location.protocol == "http:" && !iatDev ? "h" : "") + "fp.gdmdigital.com/" + flexId + ".js?r=" + Math.random() * 1e16 + "&m=992&a=" + flexId + (iatDev ? "&d=1" : "")))
            }
        }, 
        
        // takes a function runs it async N-times and also returns the 
        setInterval: function(fn, ms, maxRetries) {
            var runTimes = 0
            var interval = setInterval( function() {
                fn(); 
                runTimes ++;
                if( maxRetries && runTimes >= maxRetries ) clearInterval( interval )
            }, ms );
            
            return interval; // allow the interval to be cleared;
        }, 
        
    }
    
    GDMObject.Utils = Utils;
}(GDMObject));

Utils = GDMObject.Utils;




(function(GDMObject){
    
    /**
     * @Class Storage
     *
     */

    function Storage(namespace) {
        this.method = 'localStorage';
        this.namespace = namespace;
        this.sessionTimeOutMinutes = 60;
        this.isSupported = supportStorage(this.method);
    }
  
    Storage.prototype.store = function(object) {
        if(this.isSupported) {
            for(var key in object) {
                window[this.method][this.namespace + key] = object[key];
            }
        }
    };
    Storage.prototype.load = function(array) {
        var result = {};
        if(this.isSupported) {
            for(var i = 0, len = array.length; i < len; i += 1) {
                var key = array[i];
                result[key] = window[this.method][this.namespace + key];
            }
        }
        return result;
    };
    
    var tested = {};
    
    function supportStorage(method) {
        if (tested.length) return tested.supported;
        var test = 'testStorage';
        try {
            window[method].setItem(test, test);
            window[method].removeItem(test);
            tested.supported = true;
            return true;
        } catch(e) {
            tested.supported = false;
            return false;
        }
    }
    
    GDMObject.Storage = Storage;
}(GDMObject))

Storage = GDMObject.Storage;



(function() {
    /**
     * Generates a GDMHandler Instance and starts it.
     *
     */

    function startGDM() {
        var gdmHandler;
        gdmHandler = new GDMHandler( veTagData.settings.gdm);
        gdmHandler.start();
    }
    if ( veTagData && veTagData.settings && veTagData.settings.gdm ) {
        startGDM()
    }
}());