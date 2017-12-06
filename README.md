### Backend for the starter applications of IoT4I

#### How to run in IBM Cloud
##### Deploy through IBM Cloud Continuous Delivery

[![Deploy to IBM Cloud](https://bluemix.net/deploy/button.png)](https://bluemix.net/deploy?repository=https://github.com/ibm-watson-iot/ioti-starter-app-backend)

#### How to run locally
1. Create a config file under `config` directory with a name `config-dev.json`. You can use the template file `/config/config-template.json`.
2. Start the Nodejs application `node app.js`

#### How to run in a different environment
1. Create a config file under `config` directory specific to your environment. Name of the config file must contain your environment's name. If your environment's name is `test`, you must create a config file with a name `config-test.json`. You can use the template file `/config/config-template.json`.
2. Set the following environment variable `APP_ENV` with your environment's name.
3. Start the Nodejs application `node app.js`


### Actions
This repo has also some example actions that can be configured with IoT4i. The actions are listed below:

- Email action which uses nodemailer to send emails. An html email template was designed using https://beefree.io/ and converted to [pug](https://pugjs.org). The template accepts hazard information like shieldId, locations and events from the email action. 
- Phone call action which uses [twilio](https://www.twilio.com) to call phone number.
- Send sms action which uses [twilio](https://www.twilio.com) to sends sms to a phone number.
- Push action which uses IBM Cloud push notification to send alerts.
- Websocket action to send websocket notifications to browser. 
