class RuntimeConfig {
    constructor() {
        this.command = null;
        this.isValidCommand = false;
        this.environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'dev';

        this.useDevServer = null;
        this.devServerUrl = null;
        this.devServerHttps = null;

        this.helpRequested = false;
    }
}

module.exports = RuntimeConfig;
