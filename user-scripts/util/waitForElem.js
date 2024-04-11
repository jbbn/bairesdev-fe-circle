if (typeof UserScript === 'undefined') {
  var UserScript = {};
}

UserScript.waitForElem = async function (selector, opts) {
  const { timeout = 60000 } = opts || {}

  return new Promise((resolve, reject) => {
    let timer;
    const tryGetElement = () => {
      const element = document.querySelector(selector);
      if (element) {
        clearTimeout(timer); // stop the timer if the element is found
        resolve(element);
      }
    };
    timer = setInterval(tryGetElement, 100); // try to find element every 100ms
    setTimeout(() => { // stop trying after timeout
      clearInterval(timer);
      reject('Timeout! Element not found.');
    }, timeout);
  });
}
