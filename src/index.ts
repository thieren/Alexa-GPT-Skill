import {
  SkillBuilders,
} from 'ask-sdk-core';

import express from 'express';
import { ExpressAdapter } from 'ask-sdk-express-adapter';

import fs from 'fs';
import https from 'https'

import {
  LaunchRequestHandler,
  QuestionIntentHandler,
  FallbackIntentHandler,
  HelpIntentHandler,
  CancelAndStopIntentHandler,
  SessionEndedRequestHandler,
  SkillErrorHandler
} from './alexaHandles';

const config = require(__dirname + '/../config.json');


const app = express();
const skillBuilder = SkillBuilders.custom().addRequestHandlers(
          LaunchRequestHandler,
          QuestionIntentHandler,
          FallbackIntentHandler,
          HelpIntentHandler,
          CancelAndStopIntentHandler,
          SessionEndedRequestHandler,
        )
        .addErrorHandlers(SkillErrorHandler);
const skill = skillBuilder.create();
const adapter = new ExpressAdapter(skill, true, true);

app.post('/', adapter.getRequestHandlers());

https.createServer({
  key: fs.readFileSync(__dirname + '/../cert/' + config.cert_key_file),
  cert: fs.readFileSync(__dirname + '/../cert/' + config.cert_pem_file)
}, app)
.listen(config.port, () => {
  console.log('Server is listening on port ' + config.port);
});