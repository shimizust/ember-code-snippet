/*jshint node: true */
'use strict';

var fs   = require('fs');
var mergeTrees = require('broccoli-merge-trees');
var flatiron = require('broccoli-flatiron');
var snippetFinder = require('./snippet-finder');
var findHost = require('./utils/findHost');

module.exports = {
  name: 'ember-code-snippet',

  snippetPaths: function() {
    var app = findHost(this);
    return app.options.snippetPaths || ['snippets'];
  },

  snippetSearchPaths: function(){
    var app = findHost(this);
    return app.options.snippetSearchPaths || ['app'];
  },

  snippetRegexes: function() {
    var app = findHost(this);
    return [{
      begin: /\bBEGIN-SNIPPET\s+(\S+)\b/,
      end: /\bEND-SNIPPET\b/
    }].concat(app.options.snippetRegexes || []);
  },

  snippetExtensions: function() {
    var app = findHost(this);
    return app.options.snippetExtensions || ['js','ts','coffee','html','hbs','md','css','sass','scss','less','emblem','yaml'];
  },

  includeExtensions: function() {
    var app = findHost(this);
    return app.options.includeFileExtensionInSnippetNames !== false;
  },

  includeHighlightJS: function() {
    var app = findHost(this);
    if (typeof app.options.includeHighlightJS === 'boolean') {
      return app.options.includeHighlightJS;
    } else {
      return true;
    }
  },

  includeHighlightStyle: function() {
    var app = findHost(this);
    if (typeof app.options.includeHighlightStyle === 'boolean') {
      return app.options.includeHighlightStyle;
    } else {
      return true;
    }
  },

  treeForApp: function(tree){
    var snippets = mergeTrees(this.snippetPaths().filter(function(path){
      return fs.existsSync(path);
    }));

    var snippetOptions = {
      snippetRegexes: this.snippetRegexes(),
      includeExtensions: this.includeExtensions(),
      snippetExtensions: this.snippetExtensions()
    };

    snippets = mergeTrees(this.snippetSearchPaths().map(function(path){
      return snippetFinder(path, snippetOptions);
    }).concat(snippets));

    snippets = flatiron(snippets, {
      outputFile: 'snippets.js'
    });

    return mergeTrees([tree, snippets]);
  },

  included: function(app) {
    if (this.includeHighlightJS()) {
      app.import('vendor/highlight.pack.js', { using: [
        { transformation: 'amd', as: 'highlight.js' }
      ] } );
    }
    if (this.includeHighlightStyle()) {
      app.import('vendor/highlight-style.css');
    }
  }
};
