/*
 * This file is part of the Symfony package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

const inquirer = require('inquirer');

const jsTypeVanilla = 'JS_TYPE_VANILLA';
const jsTypeReact = 'JS_TYPE_REACT';
const jsTypeVue = 'JS_TYPE_VUE';

const cssTypeCss = 'CSS_TYPE_CSS';
const cssTypeSass = 'CSS_TYPE_SASS';
const cssTypeLess = 'CSS_TYPE_LESS';

function askIsSPA() {
    const spaType = 'TYPE_SPA';
    const multiType = 'TYPE_MULTI';

    return inquirer.prompt({
        type: 'list',
        message: 'What type of app are you creating?',
        name: 'appType',
        choices: [
            {
                name: 'A) Single Page Application (SPA)',
                value: spaType
            },
            {
                name: 'B) Traditional multi-page app',
                value: multiType
            }
        ]
    // todo - could we use a wait here instead of returning a Promise?
    }).then((response) => {
        return response.appType === spaType;
    });
}

function askJavaScriptType() {
    return inquirer.prompt({
        type: 'list',
        message: 'What type of JavaScript app do you want?',
        name: 'jsType',
        choices: [
            {
                name: 'A) Vanilla JavaScript with jQuery',
                value: jsTypeVanilla
            },
            {
                name: 'B) React',
                value: jsTypeReact
            },
            {
                name: 'C) Vue.js',
                value: jsTypeVue
            }
        ]
    // todo - could we use a wait here instead of returning a Promise?
    }).then((response) => {
        return response.jsType;
    });
}

function askCssType() {
    return inquirer.prompt({
        type: 'list',
        message: 'What type of CSS do you like?',
        name: 'cssType',
        choices: [
            {
                name: 'A) Sass',
                value: cssTypeSass
            },
            {
                name: 'B) LESS',
                value: cssTypeLess
            },
            {
                name: 'C) Vanilla CSS',
                value: cssTypeCss
            }
        ]
    // todo - could we use a wait here instead of returning a Promise?
    }).then((response) => {
        return response.cssType;
    });
}

function generateApp(appConfig) {
    /*
     * Tasks:
     *      A) Create the webpack.config.js file with some
     *          varied options based on their choices
     *              (fail early if this file exists?)
     *      B) yarn add XXX --dev all the packages they will need
     *      C) Add "scripts" to their package.json file
     *          encore:dev
     *          encore:watch
     *          encore:production
     *      D) Add .postcss config file
     *      E) Add node_modules to .gitignore (if that file exists)
     *      F) Generate a mini-app, which will be vanilla JS,
     *          React or Vue.js depending on their choice. This
     *          would be their one entry
     *      G) Give them a message about what to do next
     *
     */

    console.log(appConfig);
}

function runInit() {
    const appConfig = {
        isSpa: null,
        jsType: null,
        cssType: null
    };

    askIsSPA().then(isSpa => {
        appConfig.isSpa = isSpa;
        if (isSpa) {
            askJavaScriptType().then(jsType => {
                appConfig.jsType = jsType;

                askCssType().then(cssType => {
                    appConfig.cssType = cssType;

                    generateApp(appConfig);
                });
            });
        } else {
            // for multi-page apps, the main shared entry
            // will always be vanilla JS
            appConfig.jsType = jsTypeVanilla;

            askCssType().then(cssType => {
                appConfig.cssType = cssType;

                generateApp(appConfig);
            });
        }
    });
}

module.exports = function(runtimeConfig) {
    switch (runtimeConfig.command) {
        case 'init':
            runInit();
            break;
        default:
            throw new Error(`Unknown generator command ${runtimeConfig.comma}.`);
    }
};
