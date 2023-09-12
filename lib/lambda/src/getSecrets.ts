// "use strict";
import * as AWS from 'aws-sdk';
import https = require('https');

const secretsManager = new AWS.SecretsManager();

 export async function getSecretValue (): Promise<any> {
  try {
    // Get the client ID and secret from the environment variables
    const clientId = process.env.PRIVATE_API_CLIENT_ID;
    const clientSecret = process.env.PRIVATE_API_CLIENT_SECRET;

    // Get the access token from the secrets manager
   
    const  secret = await secretsManager.getSecretValue({ SecretId: 'my-private-api-access-token' }).promise();
    let  accessToken ;// = JSON.parse(secret.SecretString);

    // let accessToken: string | undefined;
    if (secret.SecretString) {
    const secretValue = JSON.parse(secret.SecretString);
    accessToken = secretValue.access_token;
    }

    // Check if the access token is still valid
    const { exp } = JSON.parse(Buffer.from(accessToken.split('.')[1], 'base64').toString());
    if (exp > Date.now() / 1000) {
      return accessToken;
    }

    // Generate a new access token
    const options = {
      hostname: 'my-private-api.com',
      path: '/oauth/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
    };

    const data = new URLSearchParams();
    data.append('grant_type', 'client_credentials');

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const { access_token } = JSON.parse(body);
        secretsManager.putSecretValue({
          SecretId: 'my-private-api-access-token',
          SecretString: JSON.stringify({ accessToken: access_token }),
        }).promise();
        return access_token;
      });
    });

    req.on('error', (error) => {
      console.error(error);
      throw new Error('Failed to generate access token');
    });

    req.write(data.toString());
    req.end();
  } catch (error) {
    console.error(error);
    throw new Error('Failed to generate access token');
  }
  
};