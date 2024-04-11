// ==UserScript==
// @name         BD - Employee Portal - Time Tracker: Referral button
// @namespace    https://github.com/jbbn/bairesdev-fe-circle/tree/master/user-scripts
// @version      2024-04-10
// @description  User script for adding a Referral button to the header - for convenience.
// @author       https://github.com/jbbn
// @match        https://employees.bairesdev.com/time-tracker
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bairesdev.com
// @require      https://raw.githubusercontent.com/jbbn/bairesdev-fe-circle/master/user-scripts/util/waitForElem.js
// @grant        none
// ==/UserScript==

const Button = {
  ELEMENT: 'bdv-time-tracker-filters bdv-button[type="submit"]',
  LABEL: 'Referral',
  LINK: 'https://partnerships.bairesdev.com/sign-in'
}

const Actions = {
  ELEMENT: 'body > bdv-root > bdv-layout > div.header > div.actions'
}

const TimeEntriesTable = {
  DATE_COLUMN_FIRST: 'bdv-data-table.neutral-table tbody tr #date_0'
}

async function addReferralButton() {
  // Get the element to which you want to prepend the HTML string
  const actionsElement = await document.querySelector(Actions.ELEMENT);

  // Get the existing button
  const buttonElement = await document.querySelector(Button.ELEMENT);

  // Clone the existing button
  const newButton = buttonElement.cloneNode(true);

  // Clear the onclick attribute
  newButton.textContent = Button.LABEL

  // Set up an "open url" action on click
  newButton.addEventListener('click', function () {
    window.open(Button.LINK, '_blank');
  });

  // Add the new button to the DOM
  actionsElement.prepend(newButton);
}

async function mount() {
  // wait the main content to load
  await UserScript.waitForElem(TimeEntriesTable.DATE_COLUMN_FIRST);

  addReferralButton();
}

window.addEventListener('load', mount, false);
