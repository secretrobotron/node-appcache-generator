/*
 * node-appcache-generator
 * https://github.com/arcturus/node-appcache-generator
 *
 * Copyright (c) 2013 Francisco Jordano
 * Licensed under the MPL 2.0 license.
 */

'use strict';

var child_process = require('child_process');
var path = require('path');

var AppCacheGenerator = function(sources, network, fallback, hidden, NL) {
  this.sources = sources || [];
  this.network = network || [];
  this.fallback = fallback || [];
  this.hidden = hidden || false;
  this.NL = NL || '\n';
};

AppCacheGenerator.prototype.generate = function(md5hash) {
  // Use contactenation since seems that is faster
  // than array join.
  var content = 'CACHE MANIFEST' + this.NL;

  // Add md5hash of the requested dir as a checksum
  content += '# Checksum ' + md5hash + this.NL;

  var self = this;

  content += this.NL;

  // Cache section
  content += 'CACHE:' + this.NL;
  this.sources.forEach(function(source) {
    content += source + self.NL;
  });

  content += this.NL;

  // Network section
  content += 'NETWORK:' + this.NL;
  this.network.forEach(function(nt) {
    content += nt + self.NL;
  });

  content += this.NL;

  // Fallback section
  content += 'FALLBACK:' + this.NL;
  this.fallback.forEach(function(fb) {
    content += fb + self.NL;
  });

  return content;
};

AppCacheGenerator.prototype.generateFromDir = function(dirName, cb) {
  if (!dirName || !cb) {
    throw new Error('Invalid parameters');
  }

  var readdir = require('recursive-readdir');
  var self = this;
  readdir(dirName, function onReadDir(err, files) {
    if (err) {
      cb(err);
      return;
    }

    self.sources = [];
    files.forEach(function onFile(file) {
      if (!self.hidden && path.basename(file).indexOf('.') === 0) {
        return;
      }

      self.sources.push(file.substr(dirName.length + 1));
    });

    child_process.exec('tar -c ' + dirName + ' | openssl md5',
      function (error, stdout, stderr) {
        if (error !== null) {
          console.error('exec error: ' + error);
          console.error(stderr);
        }
        else {
          cb(null, self.generate(stdout.substr(0, stdout.length - 1)));
        }
      });
  });
};

var AppCacheValidator = function() {

};

AppCacheValidator.prototype.validate = function(manifest) {
  if (manifest) {
    console.log('ok');
  }
};

exports.Generator = AppCacheGenerator;
exports.Validator = AppCacheValidator;
