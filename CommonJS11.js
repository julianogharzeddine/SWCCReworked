var bool = false;
var currentURL;
var currentLanguage;

$(document).ready(function () {

    // Fetching the current URL
    currentURL = window.location.href;
    
    // Default Language Keyword is set to RuntimeAR
    const runtimeKeyword = "RuntimeAR";

    // Setting the language globally
    if (currentURL.includes(runtimeKeyword)) {
        currentLanguage = "AR"
    } else {
        currentLanguage = "EN"
    }

    // Changing the language to english
    $("[name='EnglishFlag']").on("click", function () {
        updateURL("EnglishFlag");
    });

      // Changing the language to arabic
    $("[name='ArabicFlag']").on("click", function () {
        updateURL("ArabicFlag");
    });

});

// Function to update the URL based on flag clicks
function updateURL(keyword) {

    let newURL;

    // Switching to English Runtime
    if (keyword === "EnglishFlag") {
        if (currentURL.includes("RuntimeAR")) {
            newURL = currentURL.replace("RuntimeAR", "Runtime");
        }

    // Switching to Arabic Runtime
    } else if (keyword === "ArabicFlag") {
        if (!currentURL.includes("RuntimeAR")) {
            newURL = currentURL.replace("Runtime", "RuntimeAR");
        }
    }

    // Change the URL and immediately go to the new URL in the same tab
    if (newURL) {
        window.location.replace(newURL);
    }
}

function langIsAr(){
    return currentLanguage == "AR"
}

function isTrue(prop) {
    return prop == "true"
}

function goTo(href) {
    if (href) {
        window.open(href, "_self")
    }
}

function scaleText() {
    const titleText = $('.cardTitle')
    langIsAr() ? titleText.css('transform', 'scale(1)') : titleText.css('transform', 'scale(0.85)')
}
