(function () {

    var baseURL;   // fetching the base URL

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

        const sectionTitleLabel = langIsAr() ? "أقسامنا المختلفة" : "Our Departments"

        $('#sectionBrowser').html('')
        $('#sectionBrowser').append(`<p id="sectionBrowserInitialTitle" class="sectionTitle"> ${sectionTitleLabel}</p>`)
        $("#sectionBrowser").append("<div id='categories-card-wrapper' class='standardCardWrapper'></div>")

        data.map((tile) => {
            const categoryID = tile.ID ?? ""
            const isActive = isTrue(tile.IsActive)
            const categoryName = langIsAr() ? tile.CategoryNameAR : tile.CategoryNameEN
            const categoryImageURL = tile.CategoryImageURL ?? ""
            const isDisplayable = isTrue(tile.IsCardDisplayable)
            const isClickable = isTrue(tile.IsClickable)
            const cardID = tile.JavaScriptID ?? ""
            const categoryURL = tile.CategoryURL ?? ""
            const desc = langIsAr() ? tile.CategoryDescriptionAR : tile.CategoryDescriptionEN

            // If the category is Active and Displayable as card , we render it
            if (isActive && isDisplayable) {
                $("#categories-card-wrapper").append(`
          <div class="cardItem" id="${cardID}" data-cat="${categoryID}" ${isClickable ? `onclick="goTo('${categoryURL + "?categoryID=" + (categoryID ?? "")}')"` : ""}>
          <div class='imageWrapper'>
          <img src="${categoryImageURL}" class='titleImage' alt="ServiceImage.jpeg">
          </div>
          <div class='TitleAndDescWrapper'>
          <p class="cardTitle">${categoryName}</p>
          <p class="serviceDescription"> ${desc} </p>
          </div>
          </div>
        `)
            }
        })

        scaleText()
    }
})()
