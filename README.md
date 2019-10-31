# TestCafe Reporter Slack Custom
### testcafe-reporter-slack-custom

This is a reporter for [TestCafe](http://devexpress.github.io/testcafe). It sends the output of the test to [Slack](https://slack.com/).

## Purpose
Once configured the reporter sends test results to Slack channel, e.g.

![Slack report - success](assets/slack-report-success.png)

![Slack report - failed](assets/slack-report-failed.png)

## Installation

Install this reporter as your test project dependency:

```bash
yarn add testcafe-reporter-slack-custom
```

## Setup instructions
In order to use this TestCafe reporter plugin, it is necessary to add it as your reporter to your TestCafe.

### Using `.testcaferc.json` config file

Add a reporter name (`slack-custom`) to your `reporter` object:

```json
{
  "browsers": [ "chrome" ],
  "src": "scenarios",
  "reporter": [
    {
      "name": "slack-custom"
    }
  ]
}
```

### Using TestCafe API

Pass the reporter name (`slack-custom`) to the `reporter()` method:

```js
testCafe
    .createRunner()
    .src('path/to/test/file.js')
    .browsers('chrome')
    .reporter('slack-custom') // <-
    .run();
```

### Necessary configuration

After that, you should define **.env** file with variables in your test project, hence the folder from where your call TestCafe (root directory).

```dotenv
# .env
TESTCAFE_SLACK_WEBHOOK=https://hooks.slack.com/services/*****
```

This is **required minimum to have the reporter working**.

## Options

Slack reporter have few options which could be configured from both, `.testcaferc.json` or `.env` file as global variables.
**It will first retrieve the values from the TestCafe config file `.testcaferc.json`**, after that from `.env` file.

* :warning: - **required**
* :balloon: - optional

#### Slack Webhook URL :warning:

**This option is required!** Your Slack channel webhook URL generated from Slack API to allow reporter post there.
It's **not recommended** to pass your `webhookUrl` into the config file, in this case, due to sensitive data, it's **better to pass it via global variable** in `.env` file.
* via `.testcaferc.json`

```json
{
  "name": "slack-custom",
  "options": {
    "webhookUrl": "https://hooks.slack.com/services/*****"
  }
}
```

* via `.env` file

```dotenv
# .env
TESTCAFE_SLACK_WEBHOOK=https://hooks.slack.com/services/*****
```

#### Logging level

Choose your report logging level, if you want to see each test with error stack trace, choose `DETAILED` (default). The second one is short & condensed which shows the only number of tests which passed, failed, and were skipped - `SUMMARY`.

* via `.testcaferc.json`

```json
{
  "name": "slack-custom",
  "options": {
    "loggingLevel": "SUMMARY"
  }
}
```

* via `.env` file

```dotenv
# .env
TESTCAFE_SLACK_LOGGING_LEVEL=SUMMARY
```

#### Quiet mode

Choose if you want to have messages in the terminal about sending specific messages to Slack, it's turned off by default.

* via `.testcaferc.json`

```json
{
  "name": "slack-custom",
  "options": {
    "quietMode": true
  }
}
```

* via `.env` file

```dotenv
# .env
TESTCAFE_SLACK_QUIET_MODE=true
```

## Further Documentation :books:
[TestCafe Reporter Plugins](https://devexpress.github.io/testcafe/documentation/extending-testcafe/reporter-plugin/)
