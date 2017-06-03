class RuntimeConfig {
    constructor() {
        this.command = null;
        this.context = null;
        this.isValidCommand = false;
        this.environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';

        this.useDevServer = null;
        this.devServerUrl = null;
        this.devServerHttps = null;

        this.babelRcFileExists = null;

        this.helpRequested = false;
    }
}

module.exports = RuntimeConfig;
