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
var utils = caf.myutils;
var async = caf.async;
var genProxy = caf.gen_proxy;
var wc = require('./wildcard');


/* Do not have standard inputs*/
var ODD_IDOL_APIs = ['createtextindex','deletetextindex', 'listindex'];


var IDOL_APIs = ['detectlanguage', 'explodecontainer',
                 'readbarcode','addtotextindex', 'extractentity',
                 'expandterm', 'extracttext', 'findfaces','findsimilar',
                 'highlight', 'detectimage', 'view', 'ocr', 'query',
                 'dynamicthesaurus', 'detectsentiment', 'storeobject',
                 'tokenize'].concat(ODD_IDOL_APIs);

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



    /**
     * Generic idol invocation. Compatible with caf_conduit. If more than
     * one file reference is found after filtering, multiple API calls are
     *  executed in parallel,
     * and results are returned in an object that uses for keys the name of the
     *  file in the container, and values the returned data from the call.
     *
     * @param {string} op An idol web api command.
     * @param {Object} acc An accumulator for results filled by caf_conduit.
     * @param {Object} args Arguments to idol api.
     * @param {Object.<string, string>} deps Other tasks it reads data from.
     * @param {string} label A name in acc for this task.
     * @param {caf.cb} cb0 Callback to return error or results.
     *
     */
    var genF = function(op, acc, args, deps, label, cb0) {
        if (ODD_IDOL_APIs.lastIndexOf(op) >= 0) {
            // no standard inputs
            idol.invoke(op, utils.clone(args), cb0);
        } else {
            var source = wc.resolve(acc, deps, args);
            if (source && typeof source === 'object') {
                if ((typeof source.reference === 'string') ||
                    (typeof source.text === 'string') ||
                    (typeof source.url === 'string')) {
                    //one input call
                    idol.invoke(op, utils.clone(args), cb0);
                } else if (Array.isArray(source.files)) {
                    //many input files processed in parallel
                    async.map(source.files,
                              function(x, cb1) {
                                  var ref = {'reference': x.reference};
                                  var nArgs = utils.cloneAndMix(args, ref);
                                  idol.invoke(op, nArgs, cb1);
                              },
                              function(err, results) {
                                  if (err) {
                                      cb0(err);
                                  } else {
                                      var res = {};
                                      source.files
                                          .forEach(function(x, i) {
                                                       res[x.name] = results[i];
                                                   });
                                      cb0(err, res);
                                  }
                              });
                } else {
                    cb0('Error: genF source not matching' +
                       JSON.stringify(source));
                }
            } else {
                cb0('Error: genF source not an object' +
                   JSON.stringify(source));
            }
        }
    };

    // See APIs documentation at https://www.idolondemand.com/developer
    IDOL_APIs.forEach(function(x) {
                          that[x] = function(acc, args, deps, label, cb0) {
                              genF(x, acc, args, deps, label, cb0);
                          };
                      });


    Object.freeze(that);
    cb(null, that);
};
