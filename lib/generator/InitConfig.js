/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

class InitConfig {
    constructor(projectPath) {
        this._projectPath = projectPath;
        this._outputPath = null;
        this._publicPath = null;
        this._cssType = null;
    }

    get projectPath() {
        return this._projectPath;
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

    get cssType() {
        return this._cssType;
    }

    set cssType(value) {
        this._cssType = value;
    }

    get cssFileExtension() {
        switch (this.cssType) {
            case InitConfig.cssTypeSass:
                return 'scss';
            case InitConfig.cssTypeLess:
                return 'less';
            default:
                return 'css';
        }
    }
}

InitConfig.cssTypeCss = 'CSS_TYPE_CSS';
InitConfig.cssTypeSass = 'CSS_TYPE_SASS';
InitConfig.cssTypeLess = 'CSS_TYPE_LESS';

module.exports = InitConfig;
