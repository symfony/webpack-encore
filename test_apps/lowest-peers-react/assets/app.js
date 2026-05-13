/*
 * This file is part of the Symfony Webpack Encore package.
 *
 * (c) Fabien Potencier <fabien@symfony.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

'use strict';

import React from 'react';
import { createRoot } from 'react-dom/client';

function App() {
    return <h1>Hello world!</h1>;
}

const container = document.getElementById('root');
if (container) {
    createRoot(container).render(<App />);
}
