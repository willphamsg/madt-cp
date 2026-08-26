// Karma configuration file

module.exports = function karmaConfig(config) {
    config.set({
        basePath: '',
        frameworks: ['jasmine'],
        plugins: [
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine-html-reporter'),
            require('karma-coverage'),
        ],
        client: {
            jasmine: {
                defaultTimeoutInterval: 60000,
            },
            clearContext: false,
        },
        jasmineHtmlReporter: {
            suppressAll: true,
        },
        coverageReporter: {
            dir: require('node:path').join(__dirname, './coverage/madt'),
            subdir: '.',
            reporters: [{ type: 'html' }, { type: 'text-summary' }, { type: 'lcovonly' }, { type: 'cobertura' }],
            check: {
                global: {
                    statements: 80,
                    branches: 80,
                    functions: 80,
                    lines: 80,
                },
            },
        },
        reporters: ['progress', 'kjhtml', 'coverage'],
        browsers: ['ChromeHeadless'],
        customLaunchers: {
            ChromeHeadlessCI: {
                base: 'ChromeHeadless',
                flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
            },
        },
        restartOnFileChange: false,
        browserNoActivityTimeout: 120000,
        browserDisconnectTimeout: 30000,
        browserDisconnectTolerance: 3,
    });
};
