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
};

const testCafeConfigFilePath = resolvePath('.testcaferc.json');

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

const reporterConfig = loadReporterConfig();
const config = {...defaultConfig, ...reporterConfig.options};

export default config;
