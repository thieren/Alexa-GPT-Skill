## Introduction / What is this?

This is an Alexa skill that enables you to chat with OpenAI's text generator. It uses the OpenAI API to generate answers to your spoken words.

It is mostly a proof of concept work.

Since this was written on one afternoon please don't expect this to be flawless.

## Requirements

What you'll need:

- An Amazon developer account

  You'll have to create the appropriate skill yourself in your account. I did not publish this skill to the Alexa Skill Store since I did this just for testing.

- An OpenAI beta account

  You'll need an API-key to access the OpenAI framework

- An server to run this code as the HTTPS Endpoint for the Alexa skill

- SSL-Certificates for your server (you can use public certificates e.g. Let's Encrypt or self signed)

## How to use

Here are a few steps to make this work. Some understanding of programming is required since I won't go into much detail:

1. Get the API-key from your OpenAI beta account
2. Put your ssl certificates into the `cert` folder.
3. clone this repo to your server. install the dependencies and set everything in the `config.json` file (like API-key, certificate files, ...)
4. Build (e.g. `npm run build`)
5. Run the server, make sure it is accessible from the internet on port 443
6. create an Alexa skill and import the appropriate interaction model json from `/alexa`
7. Edit the needed settings for the skill, like Endpoints to point to your server and invocations
8. Build the model and test it in your dev account or on your echo devices

## config.json

```
{
  "apiKey": "YOUR_OWN_OPENAI_API_KEY",  // the OpenAI API key
  "port": 443,                          // port to run the server on (has to be 443 on internet side, if you use NAT you can use any port that's free on your system)
  "cert_key_file": "my.server.com.key", // file to your private ssl certificate key file
  "cert_pem_file": "my.server.com.pem"  // file to your public ssl certificate pem file
}
```

## Caveats

- Only available in german for now (will add english soon)
- Generated text input is heavily dependend on the microphones of your echo device, which are not that good sometimes. However I had pretty decent results so far.
- OpenAI API requests will count against your usage quota - for now every beta account gets some free usage, but you'll have to pay after this is used up
