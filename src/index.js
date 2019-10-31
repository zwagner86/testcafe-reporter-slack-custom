import config from './config';
import SlackMessage from './SlackMessage';
import LoggingLevels from './const/LoggingLevels';
import emojis from './utils/emojis';
import {bold, italics} from './utils/textFormatters';

const {
    loggingLevel,
    testingEnvironment,
    alertChannelOnError
} = config;

export default function() {
    return {
        noColors: true,

        reportTaskStart(startTime, userAgents, testCount) {
            this.slack = new SlackMessage();
            this.startTime = startTime;
            this.testCount = testCount;

            const startTimeFormatted = this.moment(this.startTime).format('M/D/YYYY h:mm:ss a');
            const startMessage = `${emojis.rocket} ${'Starting TestCafe:'} ${bold(startTimeFormatted)}\n`;
            const runMessage = `${emojis.computer} Running ${bold(testCount)} tests in: ${bold(userAgents)}\n`;
            const envMessage = (testingEnvironment) ? `${emojis.environment} Test Environment: ${bold(testingEnvironment)}\n` : '';

            this.slack.sendMessage(`${startMessage}${runMessage}${envMessage}`);
        },

        reportFixtureStart(name) {
            this.currentFixtureName = name;

            if (loggingLevel === LoggingLevels.DETAILED) {
                this.slack.addMessage(bold(this.currentFixtureName));
            }
        },

        reportTestDone(name, testRunInfo) {
            let message = null;
            const hasErr = !!testRunInfo.errs.length;

            if (testRunInfo.skipped) {
                message = `${emojis.fastForward} ${italics(name)} - ${bold('skipped')}`;
            } else if (hasErr) {
                message = `${(alertChannelOnError) ? '@channel ' : ''}${emojis.fire} ${italics(name)} - ${bold('failed')}`;
                this.renderErrors(testRunInfo.errs);
            } else {
                message = `${emojis.checkMark} ${italics(name)}`;
            }

            if (loggingLevel === LoggingLevels.DETAILED) {
                this.slack.addMessage(message);
            }
        },

        renderErrors(errors) {
            errors.forEach((error, id) => {
                this.slack.addErrorMessage(this.formatError(error, `${id + 1} `));
            });
        },

        reportTaskDone(endTime, passed, warnings, result) {
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
                summaryStr += `${emojis.noEntry} ${bold(`${result.failedCount}/${this.testCount} failed`)}`;
            } else {
                summaryStr += `${emojis.checkMark} ${bold(`${result.passedCount}/${this.testCount} passed`)}`;
            }

            const message = `\n\n${finishedStr} ${durationStr} ${summaryStr}`;

            this.slack.addMessage(message);
            this.slack.sendTestReport(this.testCount - passed);
        }
    };
}
