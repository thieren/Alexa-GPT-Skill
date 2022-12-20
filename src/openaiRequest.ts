import { Configuration, OpenAIApi } from 'openai';

import fs from 'fs';

const config = require(__dirname + '/../config.json');

const aiConf = new Configuration({
  apiKey: config.apiKey,
});
const openai = new OpenAIApi(aiConf);

export class GPTResponse {
  private context = '';
  private startTime = new Date();
  private logFile? : fs.WriteStream;

  public async get(phrase: string): Promise<string> {
    if (this.context !== '') {
      this.context = this.context + '\n\n' + phrase;
      await this.writeToLog('\n\n' + phrase);
    } else {
      this.context = phrase;
      await this.writeToLog(phrase);
    }
  
    const response = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt: this.context,
      max_tokens: 128,
      n: 1,
    })
  
    let answer = response.data.choices[0].text;
  
    if (answer === undefined) {
      throw new Error('Keine Antwort erhalten.');
    }

    // check if answer is complete (e.g. no cut off sentences at the end)
    let lastPunctuation = answer.lastIndexOf('.');
    if (answer.lastIndexOf('?') > lastPunctuation) lastPunctuation = answer.lastIndexOf('?');
    if (answer.lastIndexOf('!') > lastPunctuation) lastPunctuation = answer.lastIndexOf('!');
    if (answer.lastIndexOf('\n') > lastPunctuation) lastPunctuation = answer.lastIndexOf('\n');
    if (lastPunctuation !== -1) {
      answer = answer.substring(0, lastPunctuation + 1);
    }
  
    this.context += answer;

    // shorten context until it is no more than the configured word count
    while (this.approximateWordCount(this.context) > 500) {
      this.context = this.context.substring(this.context.indexOf('\n') + 1);
    }
    await this.writeToLog('\n' + answer);
  
    // prepare answer for alexa
    while (answer.indexOf('\n') < 50 && answer.indexOf('\n') !== -1) {
      // cut anything that might be added by gpt at the beginning of the request
      answer = answer.substring(answer.indexOf('\n') + 1);
    }
  
    return answer;
  }

  public reset() {
    this.context = '';
    this.startTime = new Date();

    this.logFile = fs.createWriteStream(__dirname + '/../logs/' + this.generateLogFileName());
  }

  public stop() {
    this.logFile?.close();
  }

  private generateLogFileName(): string {
    return this.startTime.getFullYear() + '-' +
            (this.startTime.getMonth() + 1) + '-' +
            this.startTime.getDate() + '-' +
            this.startTime.getHours() + '.' +
            this.startTime.getMinutes() + '.' +
            this.startTime.getSeconds() + '.chatlog';
  }

  private async writeToLog(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.logFile) {
          this.logFile.write(text, () => {
            resolve();
          });
        } else {
          throw new Error('No output stream found');
        }
      } catch(err) {
        resolve();
      }
    });
  }

  private approximateWordCount(text: string): number {
    return text.split(' ').length;
  }
}