/*!
Copyright 2013 Hewlett-Packard Development Company, L.P.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

"use strict";

/**
 * Plug that calls idol on demand web APIs.
 *
 * The name of this component in framework.json should be idol_mux
 *
 * @name caf_idol/plug_idol
 * @namespace
 * @augments gen_plug
 */

var caf = require('caf_core');
var genPlug = caf.gen_plug;
var request = require('request');


/**
 * Factory method to create an idol on demand connector.
 *
 */
exports.newInstance = function(context, spec, secrets, cb) {

    var that = genPlug.constructor(spec, secrets);

    var baseURL = spec && spec.env && spec.env.baseURL ||
        'https://api.idolondemand.com/1/api/sync/';
    var postURL = spec && spec.env && spec.env.postURL ||
        '/v1';
    var proxy = (spec && spec.env && spec.env.proxy);


    /**
     * Invokes an idol on demand API using a POST method.
     *
     * @param {string} serviceName The name of the service.
     * @param {Object} req A map containing POST arguments for the service.
     * @param {caf.cb} cb The callback to return service call results/errors.
     *
     * @name caf_idol/plug_idol#invoke
     * @function
     *
     */
    that.invoke = function(serviceName, req, cb0) {
        var url = baseURL + serviceName + postURL;
        var config = {url: url,
                      json: true,
                      body: req,
                      method: 'POST'
                     };
        if (proxy) {
            config.proxy = proxy;
        }
        request(config,
                function(err, response, body) {
                    if (err) {
                        cb0(err);
                    } else {
                        cb0(null, body);
                    }
                });
    };

    cb(null, that);
};
