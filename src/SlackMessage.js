import config from './config';
import loggingLevels from './const/LoggingLevels';

export default class SlackMessage {
    constructor() {
        const SlackNode = require('slack-node');

        this.slack = new SlackNode();
        this.slack.setWebhook(config.webhookUrl);
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
        this.slack.webhook(Object.assign({
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
        this.sendMessage(this.getTestReportMessage(), numFailedTests > 0 && this.loggingLevel === loggingLevels.DETAILED
            ? {
                attachments: [{
                    color: 'danger',
                    text: `${numFailedTests} test failed`
                }]
            }
            : null
        );
    }

    getTestReportMessage() {
        let message = this.getSlackMessage();
        const errorMessage = this.getErrorMessage();

        if (errorMessage.length > 0 && this.loggingLevel === loggingLevels.DETAILED) {
            message = message + '\n\n\n```' + this.getErrorMessage() + '```';
        }
        return message;
    }

    getErrorMessage() {
        return this.errorMessages.join('\n\n\n');
    }

    getSlackMessage() {
        return this.messages.join('\n');
    }
}
