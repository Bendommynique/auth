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


import clickElement from './clickElement';

export default async () => {
  const tagNames = ['button', 'input'];
  let tagName;
  for (const name of tagNames) {
    const el = await $(`${name}[type=submit]`);
    const isDisplayed = await el?.isDisplayed();
    if (isDisplayed) {
      tagName = name;
      break;
    }
  }
  if (!tagName) {
    throw new Error('Failed to find the submit button');
  }
  await clickElement('click', 'selector', `${tagName}[type="submit"]`);
};