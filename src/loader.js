import {
  STYLE_ID_PROP_NAME,
  STYLE_CHILD_PROP_NAME,
} from './_constants';
import hash from 'string-hash';
const loaderUtils = require('loader-utils');
const NodeTemplatePlugin = require('webpack/lib/node/NodeTemplatePlugin');
const NodeTargetPlugin = require('webpack/lib/node/NodeTargetPlugin');
const LibraryTemplatePlugin = require('webpack/lib/LibraryTemplatePlugin');
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
const LimitChunkCountPlugin = require('webpack/lib/optimize/LimitChunkCountPlugin');

function btoa(str) {
  let buffer = null;
  if (str instanceof Buffer) {
    buffer = str;
  } else {
    buffer = new Buffer(str.toString(), 'binary');
  }
  return buffer.toString('base64');
}

global.btoa = btoa;

module.exports = function (source) { // eslint-disable-line func-names
  if (this.cacheable) {
    this.cacheable();
  }
  return source;
};

module.exports.pitch = function (request) { // eslint-disable-line func-names
  if (this.cacheable) {
    this.cacheable();
  }
  const query = loaderUtils.getOptions(this) || {};
  this.addDependency(this.resourcePath);
  const childFilename = 'extract-text-webpack-plugin-output-filename';
  const publicPath = typeof query.publicPath === 'string' ? query.publicPath : this._compilation.outputOptions.publicPath;
  const outputOptions = {
    filename: childFilename,
    publicPath,
  };
  const childCompiler = this._compilation.createChildCompiler('extract-text-webpack-plugin', outputOptions);
  childCompiler.apply(new NodeTemplatePlugin(outputOptions));
  childCompiler.apply(new LibraryTemplatePlugin(null, 'commonjs2'));
  childCompiler.apply(new NodeTargetPlugin());
  childCompiler.apply(new SingleEntryPlugin(this.context, `!!${request}`));
  childCompiler.apply(new LimitChunkCountPlugin({ maxChunks: 1 }));

  let source;
  childCompiler.plugin('after-compile', (compilation, callback) => {
    source = compilation.assets[childFilename] && compilation.assets[childFilename].source();

    // Remove all chunk assets
    compilation.chunks.forEach(chunk => {
      chunk.files.forEach(file => {
        delete compilation.assets[file];
      });
    });

    callback();
  });

  const callback = this.async();
  childCompiler.runAsChild((err, entries, compilation) => {
    if (err) {
      return callback(err);
    }

    if (compilation.errors.length > 0) {
      return callback(compilation.errors[0]);
    }
    compilation.fileDependencies.forEach(function (dep) { // eslint-disable-line
      this.addDependency(dep);
    }, this);
    compilation.contextDependencies.forEach(function (dep) { // eslint-disable-line
      this.addContextDependency(dep);
    }, this);
    if (!source) {
      return callback(new Error("Didn't get a result from child compiler"));
    }
    try {
      const text = this.exec(source, request);
      const css = text.toString();
      // eslint-disable-next-line callback-return
      callback(null, [
        `module.exports = ${JSON.stringify(text.locals || {})};`,
        `module.exports.${STYLE_ID_PROP_NAME} = ${JSON.stringify(hash(css))};`,
        `module.exports.${STYLE_CHILD_PROP_NAME} = ${JSON.stringify(css)};`,
      ].join('\n'));
    } catch (e) {
      return callback(e);
    }
  });
};
