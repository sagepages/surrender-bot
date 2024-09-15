const SurrenderBot = require('./SurrenderBot');
const ClientBot = require('./ClientBot');
const path = require('path')
require('dotenv').config()

// If you are not using the adblocker chromeExtension then use extensionPath = null
// const extensionPath = null

// This adblocker chrome extension is used to prevent unwanted ads appearing on screen and creating unpredictable
// ads that can't be closed easily. 
const extensionPath = path.resolve('./chromeExtension/6.8.0_0/')
const url = "https://naruto-arena.net/arena/selection"

const clientUsername= process.env.CLIENT_USERNAME
const clientPassword= process.env.CLIENT_PASSWORD
const surrenderCredentials = JSON.parse(process.env.SURRENDER_CREDENTIALS)


// Create and Start Bot for each credential found in array of creds - [{"username": "password"}, {...}]
for(let i = 0; i < surrenderCredentials.length; i++){
  new SurrenderBot(surrenderCredentials[i].username, surrenderCredentials[i].password, url, extensionPath).run()
}

// Start Client
client = new ClientBot(clientUsername, clientPassword, url, extensionPath, surrenderCredentials)
client.run()
