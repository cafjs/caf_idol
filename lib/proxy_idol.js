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
 * Proxy to access idol on demand APIs.
 *
 * @name caf_idol/proxy_idol
 * @namespace
 * @augments gen_proxy
 *
 */
var caf = require('caf_core');
var genProxy = caf.gen_proxy;

/**
 * Factory method to create a proxy to idol APIs.
 *
 * @see sup_main
 */
exports.newInstance = function(context, spec, secrets, cb) {

    var idol = secrets.idol_ca;

    var that = genProxy.constructor(spec, secrets);

    /**
     * Registers an API key.
     *
     * @param {string} key An API key.
     *
     */
    that.addKey = function(key) {
        idol.addKey(key);
    };

    /**
     * Deletes the API key.
     *
     */
    that.deleteKey = function() {
        idol.deleteKey();
    };

    /*
     * Target type is {url:<string>} | {ref:<string>}
     *
     *
     */

    /**
     * Detects the language of the given document.
     *
     * @param {Target} target A document to analyze.
     * @param {caf.cb} cb Callback to return error or
     * data with type {}
     */
    that.detectLanguage = function(target, cb) {

    };

    Object.freeze(that);
    cb(null, that);
};
