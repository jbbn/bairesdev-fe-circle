// ==UserScript==
// @name         BD - Employee Portal - Login: Custom Image
// @namespace    https://github.com/jbbn/bairesdev-fe-circle/tree/master/user-scripts
// @version      2024-04-10
// @description  Overwrite the Image of the BairesDev's Employee Portal sign in page with a custom image
// @author       https://github.com/jbbn
// @match        https://employees.bairesdev.com/login
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bairesdev.com
// @require      https://raw.githubusercontent.com/jbbn/bairesdev-fe-circle/master/user-scripts/util/waitForElem.js
// @grant        none
// ==/UserScript==

const profileImageUrl = localStorage.getItem("BD_EP_PROFILE_IMAGE_URL");

async function mount() {
  if (profileImageUrl) {
    const imageSelector = 'body > bdv-root > bdv-login > div > div.right-content > div > div > img'
    const imageElement = await UserScript.waitForElem(imageSelector)
    imageElement.src = profileImageUrl
    imageElement.style.width = 'auto'
  } else {
    console.debug('bd:employee-portal:login-custom-image','No custom image defined. (localStorage: BD_EP_PROFILE_IMAGE_URL)')
  }
}

window.addEventListener('load', mount, false);
