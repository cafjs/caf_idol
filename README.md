# CAF (Cloud Assistant Framework)

Co-design permanent, active, stateful, reliable cloud proxies with your web app.

See http://www.cafjs.com 

## CAF Lib jsonrpc

This repository contains a CAF lib to asynchronously call services using a JSON-RPC transport.


## API

    lib/proxy_jsonrpc.js
 
## Configuration Example

### framework.json

None


### ca.json


     "proxies" : [
         {
             "module": "caf_jsonrpc/proxy",
             "name": "jsonrpc",
             "description": "Invokes a method on a remote service using using a JSON-RPC transport\n Properties: <proxy> A url for an http proxy.\n",
             "env" : {
                 "serviceXXX" : {
                    "url":  "http://...."                 
                 },
                 "serviceYYY" : {
                     "url": "http://...whatever...",
                 }
            }
          }
          ...
      ]
  
  
and your code can invoke that service as follows:

    this.$.jsonrpc.invoke('serviceXXX', 'foo_method', [arg0, arg1...], cb)
    
    
where cb is a callback with standard node.js convention to return results/errors
     
            
 
