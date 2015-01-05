### Implementations

- GDM general script [ ]
- URL Matching [ ]
- Checking For Dom Elements - Auto Refresh [ ] 
- saving to Local Storage

#### OPTIONAL
- Genie Extras - purchased items [ ]
- Added Items
- Run of site tracking

``` 
var settings = {
    gdm: {
        exclude: false, // can be an array of urls for pages to exclude gdm script from
        
        flexId: '00000', // an alphanumeric string -- REQUIRED
        
        completionId: '', // the genie completion id -- REQUIRED
        
        journeyCode: '', // Genie Journey Code -- REQUIRED
        
        segmentIds: [1,2], // Genie Segment ids
        
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
```
