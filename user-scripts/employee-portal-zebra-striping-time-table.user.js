// ==UserScript==
// @name         BD - Employee Portal - Time Table: Zebra striping
// @namespace    https://www.bairesdev.com/
// @version      2024-04-10
// @description  Smart Zebra striping - highlight Odd dates
// @author       https://github.com/jbbn
// @match        https://employees.bairesdev.com/time-tracker
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bairesdev.com
// @require      https://raw.githubusercontent.com/jbbn/bairesdev-fe-circle/master/user-scripts/util/waitForElem.js
// @grant        none
// ==/UserScript==

let observer;

const config = {
  HIGHLIGH_COLOR: 'var(--bdv-color-yellow-100, #FFE2A6)'
}

const TimeEntriesTable = {
  DATE_COLUMN: 'bdv-data-table.neutral-table tr td[id^="date_"]',
  DATE_COLUMN_FIRST: 'bdv-data-table.neutral-table tbody tr #date_0',
  TBODY: 'bdv-data-table.neutral-table tbody'
}

async function highlightOddDates() {
  // change the color of each Odd date
  document.querySelectorAll(TimeEntriesTable.DATE_COLUMN).forEach((element) => {
    // Get the date string from the specified element
    const dateString = element.textContent;

    // Create a new Date object
    const date = new Date(dateString);

    // Get the day of the month
    const day = date.getDate();

    // Check if the day is odd
    const isOdd = day % 2 !== 0;

    if (isOdd) {
      element.parentElement.style.backgroundColor = config.HIGHLIGH_COLOR
    }
  })
}

async function setupHightlightOddDates() {
  // Select the tbody element you want to observe
  const tbody = await UserScript.waitForElem(TimeEntriesTable.TBODY);

  // Create a callback function to execute when mutations are observed
  const callback = async function (mutationsList, observer) {
    // console.log('All mutations happened:', mutationsList);
    await highlightOddDates()
  };

  // Create an instance of MutationObserver with the callback function
  observer = new MutationObserver(callback);

  // Set up the observer to monitor changes to child elements of the tbody
  observer.observe(tbody, { childList: true });
}

async function mount() {
  // wait the main content to load
  await UserScript.waitForElem(TimeEntriesTable.DATE_COLUMN_FIRST);

  // apply highlight first time
  await highlightOddDates()

  // setup observer for applying highlight again when needed
  setupHightlightOddDates();
}

function unmount() {
  if (observer && observer instanceof MutationObserver) {
    observer.disconnect();
    console.log('Mutation disconnected.');
  }
}

window.addEventListener('load', mount, false);
window.addEventListener('beforeunload', unmount, false);
