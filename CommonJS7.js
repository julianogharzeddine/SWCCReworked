var bool = false;
var currentURL;
var currentLanguage;

$(document).ready(function () {

    currentURL = window.location.href;

    const runtimeKeyword = "RuntimeAR";

    if (currentURL.includes(runtimeKeyword)) {
        currentLanguage = "AR"
    } else {
        currentLanguage = "EN"
    }

    $("[name='EnglishFlag']").on("click", function () {
        updateURL("EnglishFlag");
    });

    $("[name='ArabicFlag']").on("click", function () {
        updateURL("ArabicFlag");
    });

});

// Function to update the URL based on flag clicks
function updateURL(keyword) {

    let newURL;

    if (keyword === "EnglishFlag") {
        if (currentURL.includes("RuntimeAR")) {
            newURL = currentURL.replace("RuntimeAR", "Runtime");
        }

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

function detectLanguage(){
    currentLanguage == "AR" ? translateToArabic() : translateToEnglish()
}
