import config from './config';
import SlackMessage from './SlackMessage';
import LoggingLevels from './const/LoggingLevels';
import emojis from './utils/emojis';
import {bold, italics} from './utils/textFormatters';

const {
    loggingLevel,
    testingEnvironment,
    alertChannelOnError,
    reporterMethods
} = config;

module.exports = function() {
    return {
        noColors: true,

        sendMessagesFromUser(userFunctionResponse) {
            const isArray = Array.isArray(userFunctionResponse);
            const isObject = (userFunctionResponse instanceof Object);

            if (userFunctionResponse && (isArray || isObject)) {
                const messages = (isArray)
                    ? userFunctionResponse
                    : [userFunctionResponse];

                messages.forEach(({action = 'SEND', message} = {}) => {
                    if (action && message) {
                        if (action.toUpperCase() === 'SEND') {
                            this.slack.sendMessage(`${message}\n`);
                        }
                        if (action.toUpperCase() === 'ADD') {
                            this.slack.addMessage(`${message}\n`);
                        }
                    }
                });
            }
        },

        reportTaskStart(startTime, userAgents, testCount) {
            this.slack = new SlackMessage();
            this.startTime = startTime;
            this.testCount = testCount;
            this.userAgents = userAgents;

            const startTimeFormatted = this.moment(this.startTime).format('M/D/YYYY h:mm:ss a');
            const startingMessage = `---- ${emojis.rocket} ${'Starting TestCafe Test Run:'} ${bold(startTimeFormatted)} ----\n`;
            const startedMessage = `${emojis.rocket} ${'Started TestCafe:'} ${bold(startTimeFormatted)}\n`;
            const ranMessage = `${emojis.computer} Ran ${bold(this.testCount)} test${(this.testCount > 0) ? 's' : ''} in: ${bold(this.userAgents)}\n`;
            const envMessage = (testingEnvironment) ? `${emojis.environment} Test Environment: ${bold(testingEnvironment)}\n` : '';
            const defaultTaskStartMessage = `---- START OF TEST RUN ----\n${startedMessage}${ranMessage}${envMessage}\n`;

            if (reporterMethods && typeof reporterMethods.reportTaskStart === 'function') {
                try {
                    const userMessageResponse = reporterMethods.reportTaskStart(startTime, userAgents, testCount);

                    this.sendMessagesFromUser(userMessageResponse);
                } catch (error) {
                    this.slack.sendMessage(`${startingMessage}\n`);
                    this.slack.addMessage(defaultTaskStartMessage);
                }
            } else {
                this.slack.sendMessage(`${startingMessage}\n`);
                this.slack.addMessage(defaultTaskStartMessage);
            }
        },

        reportFixtureStart(name, filePath, meta) {
            this.currentFixtureName = name;

            if (reporterMethods && typeof reporterMethods.reportFixtureStart === 'function') {
                try {
                    const userMessageResponse = reporterMethods.reportFixtureStart(name, filePath, meta);

                    this.sendMessagesFromUser(userMessageResponse);
                } catch (error) {
                    if (loggingLevel === LoggingLevels.DETAILED) {
                        this.slack.addMessage(`\n${bold(this.currentFixtureName)}`);
                    }
                }
            } else if (loggingLevel === LoggingLevels.DETAILED) {
                this.slack.addMessage(`\n${bold(this.currentFixtureName)}`);
            }
        },

        reportTestDone(name, testRunInfo, meta) {
            if (reporterMethods && typeof reporterMethods.reportTestDone === 'function') {
                try {
                    const userMessageResponse = reporterMethods.reportTestDone(name, testRunInfo, meta);

                    this.sendMessagesFromUser(userMessageResponse);
                } catch (error) {
                    this.handleTestDone(name, testRunInfo);
                }
            } else {
                this.handleTestDone(name, testRunInfo);
            }
        },

        handleTestDone(name, testRunInfo) {
            let message = null;
            const hasErr = !!testRunInfo.errs.length;

            if (loggingLevel === LoggingLevels.DETAILED) {
                const durationFormatted = this.moment
                    .duration(testRunInfo.durationMs)
                    .format('h[h] mm[m] ss[s]');
                const durationStr = `${emojis.stopWatch} Duration: ${bold(durationFormatted)}\n`;

                if (testRunInfo.skipped) {
                    message = `${emojis.fastForward} ${italics(name)} - ${bold('skipped')}`;
                } else if (hasErr) {
                    message = `${emojis.fire} ${italics(name)} - ${bold('failed')} ${durationStr}`;

                    const errorMsgs = [];

                    testRunInfo.errs.forEach((error, id) => {
                        errorMsgs.push(this.formatError(error, `${id + 1} `));
                    });

                    message = message + '```' + errorMsgs.join('\n\n\n') + '```';
                } else {
                    const successIcon = testRunInfo.durationMs > config.slowTreshold ? emojis.checkMarkBlue : emojis.checkMark;

                    message = `${successIcon} ${italics(name)} ${durationStr}`;
                }

                this.slack.addMessage(message);
            } else if ((loggingLevel === LoggingLevels.SUMMARY_WITH_ERRORS) && hasErr) {
                this.renderErrors(name, testRunInfo.errs);
            }
        },

        renderErrors(testname, errors) {
            const errorMessages = [];

            errors.forEach((error, id) => {
                errorMessages.push(this.formatError(error, `${id + 1} `));
            });

            this.slack.addErrorMessage(`- ${this.currentFixtureName}\n-- ${testname}\n${errorMessages.join('\n\n')}`);
        },

        reportTaskDone(endTime, passed, warnings, result) {
            if (reporterMethods && typeof reporterMethods.reportTaskDone === 'function') {
                try {
                    const userMessageResponse = reporterMethods.reportTaskDone(endTime, passed, warnings, result);

                    this.sendMessagesFromUser(userMessageResponse);
                } catch (error) {
                    this.handleReportDone(endTime, passed, warnings, result);
                }
            } else {
                this.handleReportDone(endTime, passed, warnings, result);
            }
        },

        handleReportDone(endTime, passed, warnings, result) {
            let summaryStr = '';
            const endTimeFormatted = this.moment(endTime).format('M/D/YYYY h:mm:ss a');
            const durationMs = endTime - this.startTime;
            const durationFormatted = this.moment
                .duration(durationMs)
                .format('h[h] mm[m] ss[s]');
            const finishedStr = `${emojis.finishFlag} Testing finished at ${bold(endTimeFormatted)}\n`;
            const durationStr = `${emojis.stopWatch} Duration: ${bold(durationFormatted)}\n`;

            if (result.skippedCount) {
                summaryStr += `${emojis.fastForward} ${bold(`${result.skippedCount} skipped`)}\n`;
            }

            if (result.failedCount) {
                summaryStr += `${(alertChannelOnError) ? '@channel ' : ''}${emojis.noEntry} ${bold(`${result.failedCount}/${this.testCount} failed`)}`;
            } else {
                summaryStr += `${emojis.checkMark} ${bold(`${result.passedCount}/${this.testCount} passed`)}`;
            }

            const message = `\n\n${finishedStr} ${durationStr} ${summaryStr}`;

            this.slack.addMessage(message);
            this.slack.sendTestReport(this.testCount - passed);
        }
    };
};
