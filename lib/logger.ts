/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import pc from 'picocolors';

type MessageType = 'debug' | 'recommendation' | 'warning' | 'deprecation';

interface LoggerConfig {
    isVerbose: boolean;
    quiet: boolean;
}

const defaultConfig: LoggerConfig = {
    isVerbose: false,
    quiet: false,
};

let messages: Record<MessageType, string[]>;
let config: LoggerConfig = { ...defaultConfig };

const reset = function (): void {
    messages = {
        debug: [],
        recommendation: [],
        warning: [],
        deprecation: [],
    };
    config = Object.assign({}, defaultConfig);
};
reset();

function log(message: string): void {
    if (config.quiet) {
        return;
    }

    console.log(message);
}

export default {
    debug(message: string): void {
        messages.debug.push(message);

        if (config.isVerbose) {
            log(`${pc.bgBlack(pc.white(' DEBUG '))} ${message}`);
        }
    },

    recommendation(message: string): void {
        messages.recommendation.push(message);

        log(`${pc.bgBlue(pc.white(' RECOMMEND '))} ${message}`);
    },

    warning(message: string): void {
        messages.warning.push(message);

        log(`${pc.bgYellow(pc.black(' WARNING '))} ${pc.yellow(message)}`);
    },

    deprecation(message: string): void {
        messages.deprecation.push(message);

        log(`${pc.bgYellow(pc.black(' DEPRECATION '))} ${pc.yellow(message)}`);
    },

    getMessages(): Record<MessageType, string[]> {
        return messages;
    },

    quiet(setQuiet = true): void {
        config.quiet = setQuiet;
    },

    verbose(setVerbose = true): void {
        config.isVerbose = setVerbose;
    },

    reset(): void {
        reset();
    },
};
