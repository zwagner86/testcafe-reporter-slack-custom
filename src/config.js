require('dotenv').config();

import {
    resolvePath,
    isFileExists,
    readFile
} from './utils/fileHelpers';
import LoggingLevels from './const/LoggingLevels';

const defaultConfig = {
    webhookUrl: process.env.TESTCAFE_SLACK_WEBHOOK || 'https://hooks.slack.com/services/*****',
    loggingLevel: process.env.TESTCAFE_SLACK_LOGGING_LEVEL || LoggingLevels.DETAILED,
    quietMode: process.env.TESTCAFE_SLACK_QUIET_MODE || false,
    testingEnvironment: process.env.TESTCAFE_SLACK_TEST_ENV || null,
    alertChannelOnError: process.env.TESTCAFE_SLACK_ALERT_CHANNEL_ON_ERROR || false,
    slowTreshold: process.env.TESTCAFE_SLACK_SLOW_TRESHOLD || 60000
};

const testCafeConfigFilePath = resolvePath('.testcaferc.json');
const scReporterConfigFilePath = resolvePath('.scReporterConfig.js');

const loadReporterConfig = () => {
    if (!isFileExists(testCafeConfigFilePath)) {
        return defaultConfig;
    }

    let configRawData = null;

    try {
        configRawData = readFile(testCafeConfigFilePath);
    } catch (err) {
        return defaultConfig;
    }

    try {
        const testCafeConfig = JSON.parse(configRawData);

        return testCafeConfig.reporter.find(obj => obj.name === 'slack-custom');
    } catch (err) {
        return defaultConfig;
    }
};

const loadSlackCustomReporterConfig = () => {
    if (!isFileExists(scReporterConfigFilePath)) {
        return {};
    }

    try {
        const scReporterConfig = require(scReporterConfigFilePath);

        if (!(scReporterConfig instanceof Object)) {
            return {};
        }

        return scReporterConfig;
    } catch (err) {
        return {};
    }
};

const reporterConfig = loadReporterConfig();
const scReporterConfig = loadSlackCustomReporterConfig();
const config = {...defaultConfig, ...reporterConfig.options, ...scReporterConfig};

export default config;
