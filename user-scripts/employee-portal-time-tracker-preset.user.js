// ==UserScript==
// @name         BD - Employee Portal - Time Tracker: Presets
// @namespace    https://github.com/jbbn/bairesdev-fe-circle/tree/master/user-scripts
// @version      2024-04-11
// @description  User script for quickly filling the "Track your hours" form, with presets made from previous entries
// @author       https://github.com/jbbn
// @match        https://employees.bairesdev.com/time-tracker
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bairesdev.com
// @require      https://code.jquery.com/jquery-3.6.0.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/lodash-fp/0.10.4/lodash-fp.min.js
// @require      https://raw.githubusercontent.com/jbbn/bairesdev-fe-circle/master/user-scripts/util/waitForElem.js
// @grant        unsafeWindow
// @grant        GM_xmlhttpRequest
// @grant        GM_addElement
// ==/UserScript==

const TrackYourHoursForm = {
  FORM: 'bdv-time-tracker-form',
  FIRST_ROW: 'bdv-time-tracker-form > div > div > form > div:nth-child(1)',
  WORKED_HOURS_INPUT: '[formcontrolname="workedHours"]',
  TASK_CATEGORY_LABEL: 'label[for="bdv-select-2"]',
  TASK_CATEGORY_OPTION: '#bdv-select-2-panel bdv-option',
  TASK_DESCRIPTION_LABEL: 'label[for="bdv-select-3"]',
  TASK_DESCRIPTION_OPTION: '#bdv-select-3-panel bdv-option',
  // TODO: abstract the other selectors
}

const TimeEntriesTable = {
  DATE_COLUMN_FIRST: 'bdv-data-table.neutral-table tbody tr #date_0'
}

function hoursToDuration(hours) {
  var hrs = Math.floor(hours);
  var mins = Math.round((hours - hrs) * 60);
  return hrs.toString() + (mins < 10 ? "0" + mins : mins.toString());
}

$.extend($.expr[':'], {
  startsWith: function (elem, match) {
    console.log('startsWith', elem, match)
    return (elem.textContent || elem.innerText || "").indexOf(match[3]) == 0;
  }
});

async function timeEntryPresets() {
  const token = unsafeWindow.localStorage.getItem('bairesdev_token')
  let headersList = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  }

  // TODO: load the last 1 to 3 months entries automatically
  let bodyContent = JSON.stringify({ "fromDate": "2024-01-01T00:00:00.000Z", "toDate": "2024-01-31T23:59:59.998Z", "employee": null });

  let response = await fetch("https://employees.bairesdev.com/api/v1/employees/records", {
    method: "PUT",
    body: bodyContent,
    headers: headersList
  });

  let { data: entries } = await response.json();
  const pipe = _.flow;
  const createDistinctKey = (option) => {
    // console.log(`${option.comments.trim()}-${option.hours}`);
    return `${option.comments.trim()} (${option.hours} hour(s) - ${option.descriptionName})`
  }
  const options = pipe(
    _.filter(({ comments }) => !(comments || '').includes('Mentorship')),
    _.sortBy(createDistinctKey),
    _.uniqBy(createDistinctKey),
    _.groupBy(createDistinctKey),
  )(entries)
  console.log({ entries, options });
  // console.log(options);
  // console.log(Object.getOwnPropertyNames(_));

  const createOption = (option) => `<option>${option}</option>`
  const presetSelect = `<select>
      <option value=""> -- choose a preset -- </option>
      ${Object.keys(options).map(createOption)}
      </select>`

  const trackYourHoursFormFirstRow = await UserScript.waitForElem(TrackYourHoursForm.FIRST_ROW)
  $(trackYourHoursFormFirstRow)
    .after(presetSelect)
    .next()
    .on('change', async function (ev) {
      const [selected] = options[ev.target.value] || []

      if (selected === '') {
        return;
      }

      // console.log(selected)

      // fill worked hours
      var valueToType = hoursToDuration(selected.hours);
      const workedHoursInput = await UserScript.waitForElem(TrackYourHoursForm.WORKED_HOURS_INPUT)
      workedHoursInput.focus()
      for (let char of valueToType.split('')) {
        // Create a new KeyboardEvent
        var event = new KeyboardEvent('keydown', { key: char });
        window.dispatchEvent(event);

        if (!event.defaultPrevented) {
          workedHoursInput.value += char;
          workedHoursInput.dispatchEvent(new Event('input', {
            bubbles: true,
          }));
        }
      }

      // select task category
      $(TrackYourHoursForm.TASK_CATEGORY_LABEL).click()
      await UserScript.waitForElem(TrackYourHoursForm.TASK_CATEGORY_OPTION)
      $(`bdv-option span:contains(${selected.taskCategoryName})`).click()

      // select task description
      const taskDescriptionLabel = await UserScript.waitForElem(TrackYourHoursForm.TASK_DESCRIPTION_LABEL)
      taskDescriptionLabel.click()
      await UserScript.waitForElem(TrackYourHoursForm.TASK_DESCRIPTION_OPTION)
      $(`bdv-option span`).filter(function (_, el) {
        return $.trim($(el).text()) === selected.descriptionName;
      }).click()

      // fill the comments
      // TODO: clear content before filling
      var commentToType = selected.comments;
      const commentsInput = $('label:contains("Comments")').closest("bdv-form-field").find('textarea').get(0)
      for (let commentChar of commentToType.split('')) {
        // Create a new KeyboardEvent
        var event = new KeyboardEvent('keydown', { key: commentChar });
        unsafeWindow.dispatchEvent(event);

        if (!event.defaultPrevented) {
          commentsInput.value += commentChar;
          commentsInput.dispatchEvent(new Event('input', {
            bubbles: true,
          }));
        }
      }

      // select record type
      // TODO: clear option before trying to select
      const recordTypeLabel = await UserScript.waitForElem('label[for="bdv-select-4"]')
      $(recordTypeLabel).click()
      await UserScript.waitForElem('#bdv-select-4-panel bdv-option').then((element) => {
        $(`bdv-option span`).filter(function (_, el) {
          return $.trim($(el).text()) === selected.recordTypeName;
        }).click()
      })

      // select focal point
      const focalPointLabel = await UserScript.waitForElem('label[for="bdv-select-5"]')
      $(focalPointLabel).click()
      await UserScript.waitForElem('#bdv-select-5-panel bdv-option').then((element) => {
        $(`bdv-option span`).filter(function (_, el) {
          return $.trim($(el).text()) === selected.focalPointName;
        }).click()
      })

      // reset preset selection
      ev.target.value = ''
    })
}

async function setupPreset() {
  await UserScript.waitForElem(TrackYourHoursForm.FORM);

  await timeEntryPresets()
}

async function mount() {
  // wait the main content to load
  await UserScript.waitForElem(TimeEntriesTable.DATE_COLUMN_FIRST);

  setupPreset();
}

window.addEventListener('load', mount, false);
