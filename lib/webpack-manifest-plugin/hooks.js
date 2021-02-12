const { mkdirSync, writeFileSync } = require('fs');
const { basename, dirname, join } = require('path');

const { SyncWaterfallHook } = require('tapable');
const webpack = require('webpack');
// eslint-disable-next-line global-require
const { RawSource } = webpack.sources || require('webpack-sources');

const { generateManifest, reduceAssets, reduceChunk, transformFiles } = require('./helpers');

const compilerHookMap = new WeakMap();

const getCompilerHooks = (compiler) => {
  let hooks = compilerHookMap.get(compiler);
  if (typeof hooks === 'undefined') {
    hooks = {
      afterEmit: new SyncWaterfallHook(['manifest']),
      beforeEmit: new SyncWaterfallHook(['manifest'])
    };
    compilerHookMap.set(compiler, hooks);
  }
  return hooks;
};

const beforeRunHook = ({ emitCountMap, manifestFileName }, compiler, callback) => {
  const emitCount = emitCountMap.get(manifestFileName) || 0;
  emitCountMap.set(manifestFileName, emitCount + 1);

  /* istanbul ignore next */
  if (callback) {
    callback();
  }
};

const emitHook = function emit(
  { compiler, emitCountMap, manifestAssetId, manifestFileName, moduleAssets, options },
  compilation
) {
  const emitCount = emitCountMap.get(manifestFileName) - 1;
  // Disable everything we don't use, add asset info, show cached assets
  const stats = compilation.getStats().toJson({
    all: false,
    assets: true,
    cachedAssets: true,
    ids: true,
    publicPath: true
  });

  const publicPath = options.publicPath !== null ? options.publicPath : stats.publicPath;
  const { basePath, removeKeyHash } = options;

  emitCountMap.set(manifestFileName, emitCount);

  const auxiliaryFiles = {};
  let files = Array.from(compilation.chunks).reduce(
    (prev, chunk) => reduceChunk(prev, chunk, options, auxiliaryFiles),
    []
  );

  // module assets don't show up in assetsByChunkName, we're getting them this way
  files = stats.assets.reduce((prev, asset) => reduceAssets(prev, asset, moduleAssets), files);

  // don't add hot updates and don't add manifests from other instances
  files = files.filter(
    ({ name, path }) =>
      !path.includes('hot-update') &&
      typeof emitCountMap.get(join(compiler.options.output.path, name)) === 'undefined'
  );

  // auxiliary files are "extra" files that are probably already included
  // in other ways. Loop over files and remove any from auxiliaryFiles
  files.forEach((file) => {
    delete auxiliaryFiles[file.path];
  });
  // if there are any auxiliaryFiles left, add them to the files
  // this handles, specifically, sourcemaps
  Object.keys(auxiliaryFiles).forEach((auxiliaryFile) => {
    files = files.concat(auxiliaryFiles[auxiliaryFile]);
  });

  files = files.map((file) => {
    const changes = {
      // Append optional basepath onto all references. This allows output path to be reflected in the manifest.
      name: basePath ? basePath + file.name : file.name,
      // Similar to basePath but only affects the value (e.g. how output.publicPath turns
      // require('foo/bar') into '/public/foo/bar', see https://github.com/webpack/docs/wiki/configuration#outputpublicpath
      path: publicPath ? publicPath + file.path : file.path
    };

    // Fixes #210
    changes.name = removeKeyHash ? changes.name.replace(removeKeyHash, '') : changes.name;

    return Object.assign(file, changes);
  });

  files = transformFiles(files, options);

  let manifest = generateManifest(compilation, files, options);
  const isLastEmit = emitCount === 0;

  manifest = getCompilerHooks(compiler).beforeEmit.call(manifest);

  if (isLastEmit) {
    const output = options.serialize(manifest);
    //
    // Object.assign(compilation.assets, {
    //   [manifestAssetId]: {
    //     source() {
    //       return output;
    //     },
    //     size() {
    //       return output.length;
    //     }
    //   }
    // });
    //
    compilation.emitAsset(manifestAssetId, new RawSource(output));

    if (options.writeToFileEmit) {
      mkdirSync(dirname(manifestFileName), { recursive: true });
      writeFileSync(manifestFileName, output);
    }
  }

  getCompilerHooks(compiler).afterEmit.call(manifest);
};

const normalModuleLoaderHook = ({ moduleAssets }, loaderContext, module) => {
  const { emitFile } = loaderContext;

  // eslint-disable-next-line no-param-reassign
  loaderContext.emitFile = (file, content, sourceMap) => {
    if (module.userRequest && !moduleAssets[file]) {
      Object.assign(moduleAssets, { [file]: join(dirname(file), basename(module.userRequest)) });
    }

    return emitFile.call(module, file, content, sourceMap);
  };
};

module.exports = { beforeRunHook, emitHook, getCompilerHooks, normalModuleLoaderHook };
