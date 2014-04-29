# CAF (Cloud Assistant Framework)

Co-design permanent, active, stateful, reliable cloud proxies with your web app.

See http://www.cafjs.com 

## CAF Lib idol

WARNING: this is NOT an HP product, and there is no official support for it. It should be viewed as an example of how to provide value to a web API with CAF.  

This repository contains a CAF lib to call Idol on demand services. It is compatible with `caf_conduit` simplifying the creation of processing pipelines that use Idol.


## API

    lib/proxy_idol.js
 
## Configuration Example

### framework.json

    "plugs": [
        {
            "module": "caf_idol/plug",            
            "name": "idol_mux",
            "description": "Access to idol web APIs\n Properties: <baseURL> Default URL prefix\n <postURL> Default URL postfix \n <proxy> Optional http proxy URL\n",
            "env": {
                "baseURL": "https://api.idolondemand.com/1/api/sync/",
                "postURL": "/v1"                
                }
        }
 

### ca.json

    "internal" : [
        {
            "module": "caf_idol/plug_ca",
            "name": "idol_ca",
            "description": "Idol API access for this CA",
            "env" : {

            }
        }
     ...
     "proxies" : [
         {
            "module": "caf_idol/proxy",
            "name": "idol",
            "description": "Proxy to Idol API",
            "env" : {

            }
        }

     
            
 
