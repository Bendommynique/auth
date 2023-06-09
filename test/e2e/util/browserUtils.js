/*!
 * Copyright (c) 2015-present, Okta, Inc. and/or its affiliates. All rights reserved.
 * The Okta software accompanied by this notice is provided pursuant to the Apache License, Version 2.0 (the "License.")
 *
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0.
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * 
 * See the License for the specific language governing permissions and limitations under the License.
 */



const URL = require('url');
const ISSUER = process.env.ISSUER;
// eslint-disable-next-line node/no-deprecated-api
const issuer = URL.parse(ISSUER);
const BASE_URL = issuer.protocol + '//' + issuer.host;

export function getIssuer() {
  return ISSUER;
}

export function getBaseUrl() {
  return BASE_URL;
}

export async function openOktaHome() {
  return browser.newWindow(BASE_URL, 'Okta-hosted page');
}

export async function switchToPopupWindow(existingHandlesCount) {
  await browser.waitUntil(async () => {
    const handles = await browser.getWindowHandles();
    return handles.length > existingHandlesCount;
  });
  const handles = await browser.getWindowHandles();
  return browser.switchToWindow(handles[handles.length - 1]);
}

export async function switchToMainWindow() {
  const handles = await browser.getWindowHandles();
  return browser.switchToWindow(handles[0]);
}

export async function switchToSecondWindow() {
  const handles = await browser.getWindowHandles();
  return browser.switchToWindow(handles[1]);
}

export async function switchToLastFocusedWindow() {
  const handles = await browser.getWindowHandles();
  return browser.switchToWindow(handles[handles.length - 2]);
}

export async function reloadWindow() {
  const url = await browser.getUrl();
  await browser.url(url);
}
