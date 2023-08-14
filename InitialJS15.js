var baseURL;   // fetching the base URL
var infoIconURL = "https://srv-k2five/Designer/Runtime/File.ashx?_path=gj%2FkK8xKydFGIaBuABcSOduRX2c%3D%5Cinformation-button.png&_filerequestdata=_4XeJqbaWuJp0syOgJHEA8of-kLRzEyrnXA94YOkjasqBnsOTQgJXJ-Ybt28RDf8-rNsOJTV6GFCRJMwfDiB-T1qyY65WRx0Csth2wTf9JOReKkiiOYspbS7vEwYNJBIywx1kBd-LFpHYtIPS0xUdrkixdScIEVBKIgcyqXW3WD2a1CNZt1TjOmkHTF0prdAe6Kyil_9PHynI0KFBGfxlSpFuMC_LFnUMkZaxgfFrVy1zuKMnYwsZLNdUnn1Fg3F02l-Z5JDdXl-ChygqFDt0QT0TpYjnxCCkjbfYOS8_pU1&_height=32&_width=32&_controltype=image&XSRFToken=4399624675727584330"

$(document).ready(function () {

    // Fetching the baseURL to use it in subsequent API Calls

    baseURL = window.location.protocol + '//' + window.location.host + '/';

    initiateTiles()

    setTimeout(detectLanguage, 7000)


})


function waitForWrapperRender(data) {
    if ($('#sectionBrowser').length > 0) {
        renderTiles(data);
    } else {
        setTimeout(waitForWrapperRender, 500);
    }
}

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
    $('#sectionBrowser').append(`<p class="sectionBrowserTitle"> ${currentLanguage == "AR" ? "أقسامنا المختلفة" : "Our Departments"}</p>`)
    $("#sectionBrowser").append("<div id='categories-card-wrapper'></div>")

    data.map((tile) => {

        let isActive = isTrue(tile.IsActive)
        let isDisplayable = isTrue(tile.IsCardDisplayable)
        let isClickable = isTrue(tile.isClickable)
        let cardID = tile.JavaScriptID

        if (isActive && isDisplayable) {
            $("#categories-card-wrapper").append(`
          <div class="cardItem" id="${cardID}"  ${isClickable ? `onclick="goTo('${tile.CategoryURL ?? ""}')"` : ""} >
          <div class="infoIconContainer">
          <img src="${infoIconURL}"
            class='infoIcon'>
          </div>
          <img src="${tile.CategoryImageURL}" class='titleImage' alt="ServiceImage.jpeg">
          <p class="cardTitle">${currentLanguage == "AR" ? tile.CategoryNameAR : tile.CategoryNameEN}</p>
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
    currentLanguage == "AR" ? titleText.css('transform', 'scale(1)') : titleText.css('transform', 'scale(0.85)')
}
