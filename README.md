### Backend for the starter applications of IoT4I

#### How to run in Bluemix
##### Deploy through Bluemix devOps

[![Create toolchain](https://console.w3ibm.bluemix.net/devops/graphics/create_toolchain_button.png)](https://console.w3ibm.bluemix.net/devops/setup/deploy?repository=https://github.ibm.com/IoT-Insurance/iot4i-starter-app-backend)
(creates a new Toolchain and Delivery Pipeline for deployment)


#### How to run locally
1. Create a config file under `config` directory with a name `config-dev.json`. You can use the template file `/config/config-template.json`.
2. Create database and view in the database with the following command: `node init.js`
3. Start the Nodejs application `node app.js`

#### How to run in a different environment
1. Create a config file under `config` directory specific to your environment. Name of the config file must contain your environment's name. If your environment's name is `test`, you must create a config file with a name `config-test.json`. You can use the template file `/config/config-template.json`.
2. Create database and view in the database with the following command: `node init.js`
3. Set the following environment variable `APP_ENV` with your environment's name.
4. Start the Nodejs application `node app.js`
