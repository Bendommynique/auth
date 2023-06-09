import fetch from 'cross-fetch';
import waitFor from '@okta/test.support/waitFor';
import { AuthnTransaction } from '../../../lib/authn';
import { getWithRedirect, handleOAuthResponse, CustomUrls } from '../../../lib/oidc';
import { parseOAuthResponseFromUrl } from '../../../lib/oidc/parseFromUrl';
import A18nClient from '@okta/test.support/a18nClient';
import { sleep } from './sleep';

function mockGetWithRedirect(client, testContext) {
  jest.spyOn(client, 'getOriginalUri').mockImplementation(() => {});
  jest.spyOn(client, 'setOriginalUri').mockImplementation(() => {});
  testContext.origSetLocation = client.options.setLocation;
  client.options.setLocation = authorizeUrl => {
    testContext.authorizeUrl = authorizeUrl;
  };
  jest.spyOn(client.token.parseFromUrl, '_getLocation').mockImplementation(() => {});
}

function unmockGetWithRedirect(client, testContext) {
  client.getOriginalUri.mockRestore();
  client.setOriginalUri.mockRestore();
  client.options.setLocation = testContext.origSetLocation;
  client.token.parseFromUrl._getLocation.mockRestore();
}

async function getTokens(client, tokenParams) {
  const localContext = {
    authorizeUrl: null
  };
  mockGetWithRedirect(client, localContext);
  tokenParams = Object.assign({
    responseMode: 'fragment'
  }, tokenParams);
  getWithRedirect(client, tokenParams);
  await waitFor(() => localContext.authorizeUrl);
  const { authorizeUrl } = localContext;
  const res = await fetch(authorizeUrl as unknown as string, {
    redirect: 'manual'
  });
  const redirectUrl = res.headers.get('location');
  const oauthResponse = parseOAuthResponseFromUrl(client, {
    url: redirectUrl!,
    responseMode: 'fragment'
  });
  const transactionMeta = client.transactionManager.load();
  const tokenResponse = await handleOAuthResponse(client, transactionMeta, oauthResponse, undefined as unknown as CustomUrls);
  unmockGetWithRedirect(client, localContext);
  return tokenResponse;
}

// Performs basic login and implicit token flow
export async function signinAndGetTokens(client, tokenParams?, credentials?) {
  const username = credentials?.username || process.env.USERNAME;
  const password = credentials?.password || process.env.PASSWORD;
  const tx: AuthnTransaction = await client.signInWithCredentials({
    username,
    password
  });
  expect(tx.status).toBe('SUCCESS');
  const { sessionToken } = tx;
  const tokenResponse = await getTokens(client, Object.assign({ sessionToken }, tokenParams));
  return tokenResponse;
}

export async function signinAndGetTokensViaEmail(client, options={}) {
  const a18nClient = new A18nClient({ a18nAPIKey: process.env.A18N_API_KEY });
  const a18nProfile = await a18nClient.findProfile('myaccount-password');

  const username = process.env.PASSWORDLESS_USERNAME;
  let transaction = await client.idx.authenticate({ ...options, username });
  transaction = await client.idx.proceed({ authenticator: { methodType: 'email', id: transaction.nextStep.authenticator.id }});

  await sleep(3000);  // sleep is ugly, but required for correct email (and therefore code) to be retrieved from a18n API
  const verificationCode = await a18nClient.getEmailCode(a18nProfile.profileId, true);

  transaction = await client.idx.proceed({ verificationCode });
  return transaction;
}
