import config from './config';
import loggingLevels from './const/LoggingLevels';
import emojis from './utils/emojis';
import {bold} from './utils/textFormatters';

export default class SlackMessage {
    constructor() {
        const {IncomingWebhook} = require('@slack/webhook');

        this.slack = new IncomingWebhook(config.webhookUrl);
        this.loggingLevel = config.loggingLevel;
        this.messages = [];
        this.errorMessages = [];
    }

    addMessage(message) {
        this.messages.push(message);
    }

    addErrorMessage(message) {
        this.errorMessages.push(message);
    }

    sendMessage(message, slackProperties = null) {
        this.slack.send(Object.assign({
            text: message
        }, slackProperties), function(err, response) {
            if (!config.quietMode) {
                if (err) {
                    console.log('Unable to send a message to slack');
                    console.log(response);
                } else {
                    console.log(`The following message is send to slack: \n ${message}`);
                }
            }
        });
    }

    sendTestReport(numFailedTests) {
        this.sendMessage(
            this.getTestReportMessage(),
            (numFailedTests > 0 && (this.loggingLevel !== loggingLevels.SUMMARY))
                ? {
                    attachments: [{
                        color: 'danger',
                        text: `${numFailedTests} test${(numFailedTests > 0) ? 's' : ''} failed`
                    }]
                }
                : null
        );
    }

    getTestReportMessage() {
        let message = this.getSlackMessage();
        const errorMessage = this.getErrorMessage();

        if (errorMessage.length > 0) {
            message = message + `\n${emojis.memo} ${bold('Here is a list of errors:')}` + '\n\n\n```' + this.getErrorMessage() + '```';
        }

        return `${message}\n----- END OF TEST RUN -----\n`;
    }

    getErrorMessage() {
        return this.errorMessages.join('\n\n\n');
    }

    getSlackMessage() {
        return this.messages.join('\n');
    }
}
