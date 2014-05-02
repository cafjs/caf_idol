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
 * Utils for resolving inputs.
 *
 * @name caf_idol/wildcard
 * @namespace
 *
 */

/**
 * Maps wildcard path expressions (that ignores '/') to javascript
 * regular expressions.
 *
 * @param {Array.<string>} x An array containing wildcard expressions.
 *
 * @return {Array.<RegExp>} An array with equivalent regular expressions.
 *
 */
var wildcardToRegExp = function(x) {
    var doOne = function(pat) {
        // escape all but '*'
        pat = pat.replace(/([.+?^=!:${}()|\[\]\/\\])/g, '\\$1');
        // '*' matches everything, including '/'
        pat = pat.replace(/\*/g,'.*');
        pat = '^' + pat + '$';
        return new RegExp(pat);
    };
    var result = [];
    if (Array.isArray(x)) {
        x.forEach(function(y) {
                      if (typeof y === 'string') {
                          result.push(doOne(y));
                      }
                  });
    }
    return result;
};

/**
 * Tests whether any of the regular expressions matches the string.
 *
 * @param {Array.<RegExp>} regexpArray An array with regular expressions.
 * @param {string} str A string to be tested.
 * @return {boolean} True if any regexp matches.
 *
 */
var anyRegExp = function(regexpArray, str) {
    var result = false;
    if (typeof str === 'string') {
        result = regexpArray.some(function(reg) {
                                      return reg.test(str);
                                  });
    }
    return result;
};

/**
 * Extracts all the input file references that match any pattern in a set.
 *
 * We use a caf_conduit convention: write in acc results with
 *       { 'my label' : { err: <Object>, data : <Object>}}
 *
 * and add as values in the object `deps` the labels of our sources.
 *
 * 'data' is assumed to come  from an 'expand container' idol API
 * so the format is:
 *
 * {"files" : Array.<{"name" : string, "reference" : string}>}
 *
 *
 * @param {Array.<RegExp>} regexpArray A set of regular expressions.
 * @param {Object} acc An acumulator. See above.
 * @param {Object.<string, string>} deps Dependent inputs in acc.
 * @return {Array.<{"name":string, "reference": string}>} A collection of refs
 * from the inputs that match one of the regexps.
 *
 */
var extractRefs = function(regexpArray, acc, deps) {
    var filterF = function(all) {
        return all.filter(function(x) {
                              return (x && (typeof x === 'object') &&
                                      anyRegExp(regexpArray, x.name));
                          });
    };
    var result = [];
    Object.keys(deps).forEach(function(x) {
                                  var val = deps[x];
                                  if (typeof val === 'string') {
                                      var fi = acc[val] && acc[val].data &&
                                          acc[val].data.files;
                                      if (Array.isArray(fi)) {
                                          fi = filterF(fi);
                                          result = result.concat(fi);
                                      }
                                  }
                              });
    return result;
};

/**
 * Resolves a source handle to a collection of input files.
 *
 * SourceType is {url:string} | {reference:string} | {text:string} |
 *                 {filter: Array.<string>}
 *
 * RefType is null | {url:string} | {reference:string} | {text:string} |
 *                 {files: Array.<{"name" : string, "reference" : string}>}
 *
 * @param {Object} acc An acumulator using a caf_conduit convention.
 * @param {Object.<string, string>} deps Values are labels for dependent inputs
 *  in acc.
 * @param {SourceType} source A source handle to be resolved.
 * @return {RefType} A resolved collection of input files.
 *
 */
var resolve = exports.resolve = function(acc, deps, source) {
    if (source && typeof source === 'object') {
        if ((typeof source.reference === 'string') ||
            (typeof source.text === 'string') ||
            (typeof source.url === 'string')) {
            return source;
        } else if (Array.isArray(source.filter)) {
            var res = extractRefs(wildcardToRegExp(source.filter), acc, deps);
            return {files: res};
        } else {
            return null;
        }
    }
    return null;
};

