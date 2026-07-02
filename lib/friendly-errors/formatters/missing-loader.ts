/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { FriendlyError } from '@kocal/friendly-errors-webpack-plugin';
import pc from 'picocolors';

import loaderFeatures from '../../features.js';

interface MissingLoaderError extends FriendlyError {
    loaderName?: string;
    isVueLoader?: boolean;
    origin?: string;
}

function formatErrors(errors: MissingLoaderError[]): string[] {
    if (errors.length === 0) {
        return [];
    }

    let messages: string[] = [];

    for (const error of errors) {
        const fixes: string[] = [];

        if (error.loaderName) {
            const neededCode = `Encore.${loaderFeatures.getFeatureMethod(error.loaderName)}`;
            fixes.push(`Add ${pc.green(neededCode)} to your Webpack config file.`);

            const packageRecommendations = loaderFeatures.getMissingPackageRecommendations(
                error.loaderName
            );

            if (packageRecommendations) {
                fixes.push(
                    `${packageRecommendations.message}\n              ${packageRecommendations.installCommand}`
                );
            }
        } else {
            fixes.push(
                'You may need to install and configure a special loader for this file type.'
            );
        }

        // vue hides their filenames (via a stacktrace) inside error.origin
        if (error.isVueLoader) {
            messages.push(error.message);
            messages.push(error.origin ?? '');
            messages.push('');
        } else {
            messages = messages.concat([pc.red(`Error loading ${pc.yellow(error.file)}`), '']);
        }

        if (error.loaderName) {
            messages.push(
                `${pc.bgGreen(pc.black('FIX'))} To ${loaderFeatures.getFeatureDescription(error.loaderName)}:`
            );
        } else {
            messages.push(`${pc.bgGreen(pc.black('FIX'))} To load "${error.file}":`);
        }

        let index = 0;
        for (const fix of fixes) {
            messages.push(`        ${++index}. ${fix}`);
        }

        messages.push('');
    }

    return messages;
}

function format(errors: FriendlyError[]): string[] {
    return formatErrors(errors.filter((e) => e.type === 'loader-not-enabled'));
}

export default format;
