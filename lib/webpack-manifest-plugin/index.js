const { relative, resolve } = require('path');

const webpack = require('webpack');
const NormalModule = require('webpack/lib/NormalModule');

const { beforeRunHook, emitHook, getCompilerHooks, normalModuleLoaderHook } = require('./hooks');

const emitCountMap = new Map();

const defaults = {
  basePath: '',
  fileName: 'manifest.json',
  filter: null,
  generate: void 0,
  map: null,
  publicPath: null,
  removeKeyHash: /([a-f0-9]{32}\.?)/gi,
  // seed must be reset for each compilation. let the code initialize it to {}
  seed: void 0,
  serialize(manifest) {
    return JSON.stringify(manifest, null, 2);
  },
  sort: null,
  transformExtensions: /^(gz|map)$/i,
  useEntryKeys: false,
  writeToFileEmit: false
};

class WebpackManifestPlugin {
  constructor(opts) {
    this.options = Object.assign({}, defaults, opts);
  }

  apply(compiler) {
    const moduleAssets = {};
    const manifestFileName = resolve(compiler.options.output.path, this.options.fileName);
    const manifestAssetId = relative(compiler.options.output.path, manifestFileName);
    const beforeRun = beforeRunHook.bind(this, { emitCountMap, manifestFileName });
    const emit = emitHook.bind(this, {
      compiler,
      emitCountMap,
      manifestAssetId,
      manifestFileName,
      moduleAssets,
      options: this.options
    });
    const normalModuleLoader = normalModuleLoaderHook.bind(this, { moduleAssets });
    const hookOptions = {
      name: 'WebpackManifestPlugin',
      stage: Infinity
    };

    compiler.hooks.compilation.tap(hookOptions, (compilation) => {
      const hook = !NormalModule.getCompilationHooks
        ? compilation.hooks.normalModuleLoader
        : NormalModule.getCompilationHooks(compilation).loader;
      hook.tap(hookOptions, normalModuleLoader);
    });

    if (webpack.version.startsWith('4')) {
      compiler.hooks.emit.tap(hookOptions, emit);
    } else {
      compiler.hooks.thisCompilation.tap(hookOptions, (compilation) => {
        compilation.hooks.processAssets.tap(hookOptions, () => emit(compilation));
      });
    }

    compiler.hooks.run.tap(hookOptions, beforeRun);
    compiler.hooks.watchRun.tap(hookOptions, beforeRun);
  }
}

module.exports = { getCompilerHooks, WebpackManifestPlugin };
