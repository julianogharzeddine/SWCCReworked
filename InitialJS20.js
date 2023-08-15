var baseURL;   // fetching the base URL
var infoIconURL = "https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/InfoIcon.png"

$(document).ready(function () {

    // Fetching the baseURL to use it in subsequent API Calls
    baseURL = window.location.protocol + '//' + window.location.host + '/';

    // Initializing Tile Rendering
    initiateTiles()

})

function initiateTiles() {

    // Dynamically generating the service tiles

    fetchTiles()
        .then(function (data) {
            // Wait for the card-wrapper div to render successfully
            waitForWrapperRender(data);
        })
        .catch(function (error) {
            console.error(error);
        });

}

function waitForWrapperRender(data) {
    if ($('#sectionBrowser').length > 0) {
        renderTiles(data);
    } else {
        setTimeout(waitForWrapperRender, 500);
    }
}

function fetchTiles() {

    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'GET',
            url: `${baseURL}api/odatav4/v4/Categories_SMO`,
            dataType: 'json',
            crossDomain: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(unescape(encodeURIComponent("sp_admin" + ':' + "P@ssw0rd"))));
                xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
                xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            },
            success: function (json_data) {
                resolve(json_data.value);
            },
            error: function () {
                reject('Failed to Load Service Tiles!');
            }
        });
    });
}

function renderTiles(data) {

    $('#sectionBrowser').html('')
    $('#sectionBrowser').append(`<p class="sectionBrowserTitle"> ${langIsAr() ? "أقسامنا المختلفة" : "Our Departments"}</p>`)
    $("#sectionBrowser").append("<div id='categories-card-wrapper'></div>")

    data.map((tile) => {
        let categoryID = tile.ID
        let isActive = isTrue(tile.IsActive)
        let isDisplayable = isTrue(tile.IsCardDisplayable)
        let isClickable = isTrue(tile.isClickable)
        let cardID = tile.JavaScriptID
        let desc = (langIsAr() ? tile.CategoryDescriptionAR : tile.CategoryDescriptionEN )

        // If the category is Active and Displayable as card , we render it
        if (isActive && isDisplayable) {
            $("#categories-card-wrapper").append(`
          <div class="cardItem" id="${cardID}" data-cat="${categoryID}" ${isClickable ? `onclick="goTo('${tile.CategoryURL + "?categoryID=" + categoryID ?? ""}')"` : ""} >
          <div class='overlay'> <p> ${desc} </p> </div>
          <div class="infoIconContainer">
          <img src="${infoIconURL}"
            class='infoIcon'>
          </div>
          <img src="${tile.CategoryImageURL}" class='titleImage' alt="ServiceImage.jpeg">
          <p class="cardTitle">${langIsAr() ? tile.CategoryNameAR : tile.CategoryNameEN}</p>
          </div>
        `)
        }
    })

    scaleText()
}

function goTo(href) {
    if (href) {
        window.open(href, "_self")
    }
}

function isTrue(prop) {
    return prop == "true"
}

function scaleText() {
    let titleText = $('.cardTitle')
    langIsAr() ? titleText.css('transform', 'scale(1)') : titleText.css('transform', 'scale(0.85)')
}
