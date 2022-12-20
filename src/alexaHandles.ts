import {
  ErrorHandler,
  HandlerInput,
  RequestHandler
} from 'ask-sdk';
import {
  Response,
  SessionEndedRequest,
} from 'ask-sdk-model';

import { GPTResponse } from './openaiRequest';

const gpt = new GPTResponse();

export const LaunchRequestHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'LaunchRequest';        
  },
  handle(handlerInput : HandlerInput) : Response {
    const speechText = 'Hallo. Wie kann ich dir helfen?';

    console.log('Initializing new context...');
    gpt.reset();

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hallo. Wie kann ich dir helfen?', speechText)
      .addElicitSlotDirective('requestPhrase', {
        name: 'QuestionIntent',
        confirmationStatus: 'NONE',
        slots: {
          requestPhrase: {
            name: 'requestPhrase',
            value: "",
            confirmationStatus: 'NONE',
          }
        }
      })
      .getResponse();
  },
};

export const FallbackIntentHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;  
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.FallbackIntent';
  },
  handle(handlerInput : HandlerInput) : Response {
    console.log(handlerInput.requestEnvelope);
    const speechText = 'Entschuldigung. Das habe ich nicht verstanden. Bitte stelle deine Fragen in der Form, Computer, ich habe eine Frage.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Antwort.', speechText)
      .getResponse();
  },
};

export const QuestionIntentHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;  
    return request.type === 'IntentRequest'
      && request.intent.name === 'QuestionIntent';
  },
  async handle(handlerInput : HandlerInput) : Promise<Response> {
    try {
      const request = handlerInput.requestEnvelope.request; 
      if (request['intent'] && request['intent']['slots'] && request['intent']['slots']['requestPhrase']) {
        const slots = request['intent']['slots'];
        const phrase = slots['requestPhrase'].value;

        const answer = await gpt.get(phrase);

        return handlerInput.responseBuilder
          .speak(answer)
          .reprompt('Falls du noch mehr wissen möchtest, stelle einfach eine Folgefrage.')
          .withSimpleCard('Antwort.', answer)
          .addElicitSlotDirective('requestPhrase', request['intent'])
          .getResponse();
      } else {
        throw new Error('Es wurde keine Eingabe gefunden.');
      }
    } catch (err) {
      console.log('Error encountered: ' + err);
    }
    const speechText = 'Es ist leider ein Fehler aufgetreten. Versuche es doch noch einmal.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Fehler.', speechText)
      .getResponse();
  },
};

export const HelpIntentHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;    
    return request.type === 'IntentRequest'
      && request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput : HandlerInput) : Response {
    const speechText = 'Ich bin eine künstliche Intelligenz. Frage mich einfach etwas, oder sprich ganz normal mit mir.';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Ich bin eine künstliche Intelligenz. Frage mich einfach etwas, oder sprich ganz normal mit mir.', speechText)
      .getResponse();
  },
};

export const CancelAndStopIntentHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;
    return request.type === 'IntentRequest'
      && (request.intent.name === 'AMAZON.CancelIntent'
         || request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput : HandlerInput) : Response {
    gpt.stop();
    
    const speechText = 'Auf Wiedersehen!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Auf Wiedersehen!', speechText)
      .withShouldEndSession(true)      
      .getResponse();
  },
};

export const SessionEndedRequestHandler : RequestHandler = {
  canHandle(handlerInput : HandlerInput) : boolean {
    const request = handlerInput.requestEnvelope.request;    
    return request.type === 'SessionEndedRequest';
  },
  handle(handlerInput : HandlerInput) : Response {
    console.log(`Session ended with reason: ${(handlerInput.requestEnvelope.request as SessionEndedRequest).reason}`);
    console.log((handlerInput.requestEnvelope.request as SessionEndedRequest).error);

    gpt.stop();

    return handlerInput.responseBuilder.getResponse();
  },
};

export const SkillErrorHandler : ErrorHandler = {
  canHandle(handlerInput : HandlerInput, error : Error ) : boolean {
    return true;
  },
  handle(handlerInput : HandlerInput, error : Error) : Response {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Entschuldigung. Es ist ein Fehler aufgetreten. Bitte versuche es noch einmal.')
      .getResponse();
  }
};