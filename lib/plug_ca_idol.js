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
 * Plug that handles idol on demand calls for one CA.
 *
 * The name of this component in ca.json should be idol_ca
 *
 * @name caf_idol/plug_ca_idol
 * @namespace
 * @augments gen_transactional
 */


var caf = require('caf_core');
var genTransactional = caf.gen_transactional;

/*
 * @param {string} key A web API key.
 */
var addKeyOp = function(key) {
    return {op: 'addKey', key: key};
};

var deleteKeyOp = function() {
    return {op: 'deleteKey'};
};

/*
 * @param {Object.<string, string>} File/resource if of an exploded container
 *
 */
// var addBindingsOp = function(bindings) {
//     return {op: 'addBindings', bindings: bindings};
// };



/**
 * Factory method to create a plug for this CA's Web API calls.
 *
 * @see sup_main
 */
exports.newInstance = function(context, spec, secrets, cb) {

    var $ = context;
    var logActions = [];
    var key = null;
    var keyOld = null;
    var that = genTransactional.constructor(spec, secrets);

    that.addKey = function(newKey) {
        keyOld = key;
        key = newKey;
        logActions.push(addKeyOp(newKey));
    };

    that.deleteKey = function() {
        keyOld = key;
        key = null;
        logActions.push(deleteKeyOp());
    };


    // Dirty call, does not respect transaction
    that.invoke = function(service, req, cb0) {
        if (!key) {
            cb('Error: no API key');
        }
        req.apikey = key;
        $.idol_mux.invoke(service, req, cb0);
    };

    var replayLog = function() {
        logActions.forEach(function(action) {
                               switch (action.op) {
                               case 'addKey':
                                   key = action.key;
                                   keyOld = null;
                                   break;
                               case 'deleteKey':
                                   key = null;
                                   keyOld = null;
                                   break;
                               default:
                                   throw new Error('CA idol: invalid log' +
                                                   ' action ' + action.op);
                               }
                           });
    };

    // Framework methods

    that.__ca_init__ = function(cb0) {
        logActions = [];
        cb0(null);
    };

    that.__ca_resume__ = function(cp, cb0) {
        cp = cp || {};
        key = cp.key;
        logActions = cp.logActions || [];
        replayLog();
        cb0(null);
    };

    that.__ca_begin__ = function(msg, cb0) {
        logActions = [];
        cb0(null);
    };

    that.__ca_prepare__ = function(cb0) {
        var content = {
            'logActions' : logActions
        };
        if (key) {
            content.key = key;
        }
        cb0(null, JSON.stringify(content));
    };

    that.__ca_commit__ = function(cb0) {
        replayLog();
        cb0(null);
    };

    that.__ca_abort__ = function(cb0) {
        logActions = [];
        if (keyOld) {
            key = keyOld;
        }
        cb0(null);
    };

    cb(null, that);
};
