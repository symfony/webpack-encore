/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const path = require('path');

class InitConfig {
    constructor(projectPath) {
        this._projectPath = projectPath;
        this._outputPath = null;
        this._publicPath = null;
        this._isSpa = null;
        this._jsType = null;
        this._cssType = null;
        this._entryName = null;
        this._jsProvider = null;
    }

    get projectPath() {
        return this._projectPath;
    }

    set projectPath(value) {
        this._projectPath = value;
    }

    /**
     * Relative path to where assets are saved to this in this project.
     *
     * @return {string}
     */
    get assetRelativeDir() {
        return 'assets';
    }

    get outputPath() {
        return this._outputPath;
    }

    set outputPath(value) {
        this._outputPath = value;
    }

    get publicPath() {
        return this._publicPath;
    }

    set publicPath(value) {
        this._publicPath = value;
    }

    get isSpa() {
        return this._isSpa;
    }

    set isSpa(value) {
        this._isSpa = value;
    }

    get jsType() {
        return this._jsType;
    }

    set jsType(value) {
        this._jsType = value;
    }

    get cssType() {
        return this._cssType;
    }

    set cssType(value) {
        this._cssType = value;
    }

    get entryName() {
        return this._entryName;
    }

    set entryName(value) {
        this._entryName = value;
    }

    set jsProvider(jsProvider) {
        this._jsProvider = jsProvider;
    }

    buildJs() {
        return this._jsProvider.build(this);
    }

    getJsEntryPath() {
        return this._jsProvider.getEntryPath(this);
    }

    getJsEncoreActivationMethod() {
        return this._jsProvider.getEncoreActivationMethod(this);
    }

    getJsDependencies() {
        return this._jsProvider.getDependencies();
    }
}

InitConfig.jsTypeVanilla = 'JS_TYPE_VANILLA';
InitConfig.jsTypeReact = 'JS_TYPE_REACT';
InitConfig.jsTypeVue = 'JS_TYPE_VUE';

InitConfig.cssTypeCss = 'CSS_TYPE_CSS';
InitConfig.cssTypeSass = 'CSS_TYPE_SASS';
InitConfig.cssTypeLess = 'CSS_TYPE_LESS';

module.exports = InitConfig;
