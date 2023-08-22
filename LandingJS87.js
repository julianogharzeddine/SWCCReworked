var dictionary; // definining the dictionary
var baseURL;   // fetching the base URL
var redStatus = ["new", "New", "جديد"]
var greenStatus = ["اكتمال التحقيق"]
var orangeStatus = ["بإنتظار اعداد التقرير", "بانتظار المراجعة"]
var dateIconURL = "https://srv-k2five/Designer/Image.ashx?ImID=110252"
var investStatus = "All"
var searchKeyword = ""

$(document).ready(function () {

    // Fetching the baseURL to use it in subsequent API Calls
    baseURL = window.location.protocol + '//' + window.location.host + '/';

    // When clicking on a sidebar tile , the following will be executed
    $(document).on('click', '.categoryItemWrapper', function () {

        // Extracting the category name from the clicked option
        let categoryName = $(this).find('.categoryName').text()

        // Extracting the category id
        let categoryID = $(this).data("cat")

        // Checking whether the category should have subcategories ( isClickable would be set to false )
        let hasSubcategories = $(this).data("hassubcategories")

        if (hasSubcategories) {
            initiateSubCategoriesRender(categoryName, categoryID)
        }
    })

    // Add click event listener to each counterCard
    $(document).on("click", ".counterCard", function () {

        // Remove 'Darker' class from all counterCard divs
        $('.counterCard').removeClass('Darker');

        // Add 'Darker' class to the clicked counterCard div
        $(this).addClass('Darker');

        investStatus = $(this).data("status")
        initiateFetchInvestigations()
    })


    // Showing Investigation Options
    $(document).on('click', '#CreateInvestigationSubOption', function () {
        waitForCustomSectionWrapperRender()
    })

    // Showing all the investigations in the custom cards
    $(document).on('click', '#showAllInvestigations', function () {

        // Creating the request counters

        fetchCounters()
            .then(function (data) {
                renderCounterButtons(data)
            })
            .catch(function (error) {
                console.error(error);
            });


        initiateFetchInvestigations()

        $("[name='ShowRequests hiddenButton']").trigger("click")

    })

    // Counter cards listeners 
    $(document).on('input', '[name="SearchBox"]', function () {
        searchKeyword = $(this).val()
        initiateFetchInvestigations()
    })


    waitForSidebarRender()


})





/* --------------------------------------- SUBCATEGORY RENDERING FUNCTIONS ----------------------------------------- */

function initiateSubCategoriesRender(categoryName, categoryID) {

    // Querying the joined table between categories and subcategories
    fetchSubCategoriesJoin()
        .then(function (data) {
            waitForSubcategoryWrapperRender(data, categoryName, categoryID)
        })
        .catch(function (error) {
            console.error(error);
        });
}

function fetchSubCategoriesJoin() {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'GET',
            url: `${baseURL}api/odatav4/v4/CategoriesJoins`,
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
                reject('Failed to Load Counters !');
            }
        });
    });
}

function waitForSubcategoryWrapperRender(data, categoryName, categoryID) {
    if ($('#sectionBrowser').length > 0) {
        renderSubCategoryCards(data, categoryName, categoryID);
    } else {
        setTimeout(waitForWrapperRender, 500);
    }
}

function renderSubCategoryCards(data, categoryName, categoryID) {

    // If the categories wrapper doesn't exist yet , create it
    if ($('#subcategories-card-wrapper').length == 0) {
        $('#sectionBrowser').prepend(`<div id="subcategories-card-wrapper" class='standardCardWrapper'></div>`)
    }

    // Removing the title if it already exists
    $("#sectionBrowserLandingTitle").remove()

    // Appending it with the new value
    $('#sectionBrowser').prepend(`<p id="sectionBrowserLandingTitle" class='sectionTitle'>${categoryName}</p>`)
    $('#subcategories-card-wrapper').empty()

    data.map((item) => {


        let subCategoryID = item.ID
        let subCategoryName = langIsAr() ? item.SubCategoryNameAR : item.SubCategoryNameEN
        let subCategoryDesc = langIsAr() ? item.SubCategoryDescriptionAR : item.SubCategoryDescriptionEN
        let subCategoryImageURL = item.SubCategoryImageURL
        let subCategoryURL = item.SubCategoryURL
        let isActive = isTrue(item.IsActive)
        let isClickable = isTrue(item.IsClickable)
        let subCatJSID = item.JavaScriptID
        let foundMatch = (item.CategoryID === categoryID)

        // If the item belongs to the clicked Main Category and is active , we include it
        if (foundMatch && isActive) {
            $('#subcategories-card-wrapper').append(`
            <div class="cardItem subcategoryItem" id="${subCatJSID}" data-subcat="${subCategoryID}" ${isClickable ? `onclick="goTo('${subCategoryURL}')"` : ""}>
            <div class='imageWrapper'>
            <img src="${subCategoryImageURL}" class='titleImage' alt="Sub-Service Image.jpeg">
            </div>
            <div class='TitleAndDescWrapper'>
            <p class="cardTitle">${subCategoryName}</p>
            <p class="serviceDescription"> ${subCategoryDesc} </p>
            </div>
            </div>
            `)
        }

    })

    // Scaling text to improve readability
    scaleText()

}


/* --------------------------------------- CUSTOM OPTIONS RENDERING FUNCTIONS ----------------------------------------- */

function initiateCustomCards() { }

/* ---------------------------------------  RENDERING CATEGORY FROM URL FUNCTIONS ----------------------------------------- */

function fetchCategoryIDParameter() {

    // Create a URLSearchParams object using the current URL
    const urlSearchParams = new URLSearchParams(window.location.search);

    // Get individual parameters
    const categoryID = urlSearchParams.get('categoryID');

    return categoryID

}

function checkTargetCategory() {


    const categoryID = fetchCategoryIDParameter()
    const matchingElements = $(`.categoryItemWrapper[data-cat="${categoryID}"]`);

    if (categoryID) {
        matchingElements.click()

    }
    else {
        $(`.categoryItemWrapper[data-cat="1"]`).click()

    }

}

function waitForSidebarRender() {
    if ($('#SidebarContentWrapper').length > 0) {
        checkTargetCategory()
    } else {
        setTimeout(waitForSidebarRender, 500);
    }
}












// Wait for the Card Wrapper

function waitForInvestWrapperRender(data) {
    if ($('#card-wrapper').length > 0) {
        renderInvestCards(data);
    } else {
        setTimeout(waitForInvestWrapperRender, 500);
    }
}


function initiateFetchInvestigations() {

    // Creating the investigation cards

    fetchInvestigations()
        .then(function (data) {
            waitForInvestWrapperRender(data)
        })
        .catch(function (error) {
            console.error(error);
        });

}

// Fetching investigation details 

function fetchInvestigations() {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'GET',
            url: `${baseURL}api/odatav4/v4/RequestView_1`,
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
                reject('Failed to Load Investigations!');
            }
        });
    });
}


// Rendering Investigation Cards

function renderInvestCards(data) {

    $('#card-wrapper').html("")
    let filteredResults = 0;

    data.map((investigation) => {

        let status = investigation.Status
        let refNo = investigation.RefNo
        let creationDate = investigation.CreatedOn
        let creator = investigation.CreatedBy
        let subject = investigation.InvestigationSubject

        let containsKeyword =
            refNo.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            creationDate.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            creator.toLowerCase().includes(searchKeyword.toLowerCase()) ||
            subject.toLowerCase().includes(searchKeyword.toLowerCase());

        let targetArray = []

        switch (investStatus) {
            case "Complete":
                targetArray = greenStatus;
                break;
            case "Active":
                targetArray = orangeStatus;
                break;
            case "New":
                targetArray = redStatus;
                break;
            default: targetArray = [];
                break;
        }

        if (containsKeyword) {
            if (investStatus == "All" || targetArray.includes(status)) {
                $('#card-wrapper').append(`<div class="cardItem"><div class="cardHeader"><div class="investNoStatusWrap"><div class="status" style="background-color: ${redStatus.includes(status) ? "red" : (orangeStatus.includes(status) ? "orange" : (greenStatus.includes(status) ? "green" : "red"))};"></div><div class="investNo"><a href='https://srv-k2five/Runtime/Runtime/Form/RO.Form/?RefNo=${refNo}'>${refNo}</a></div></div><div class='dateWrapper'><div class="date">${new Date(creationDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).split("/").reverse().join("/")}</div><img src='${dateIconURL}' /></div></div><div class="cardBody"><div class="card-rows"><p class="reqCreator labelVal">${creator}</p><p class="reqCreatorLabel labelTitle">انشا من قبل</p></div><div class="card-rows"><p class="reqCreator labelVal">${status}</p><p class="reqCreatorLabel labelTitle">حالة التحقيق</p></div><div class="card-rows"><p class="reqSubject labelVal">${subject}</p><p class="reqSubjectLabel labelTitle">الموضوع</p></div></div></div>`);
                filteredResults++
            }
        }

    })

    if (filteredResults === 0) $('#noInvestigationsFound').text("No Items Found")
    else $('#noInvestigationsFound').text("")

}

// Fetching request counters 
function fetchCounters() {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'GET',
            url: `${baseURL}api/odatav4/v4/RequestView_1`,
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
                reject('Failed to Load Counters !');
            }
        });
    });
}

// Rendering the counter buttons

function renderCounterButtons(data) {

    let completedNo = 0
    let activeNo = 0
    let newNo = 0
    let totalReq = data.length

    data.map((investigation) => {

        if (redStatus.includes(investigation.Status)) newNo++
        else if (greenStatus.includes(investigation.Status)) completedNo++
        else activeNo++

        totalReq++
    })

    let content = `
  <div class="Complete counterCard" data-status="Complete">
      <p id="completeCounter" class="counterCircle">${completedNo}</p>
      <p class="counterLabel">المكتملة</p>
      <p class="totalcounter"><span class='translatable'>من </span> ${totalReq}</p>
  </div>
  <div class="Active counterCard" data-status="Active">
      <p id="activeCounter" class="counterCircle">${activeNo}</p>
      <p class="counterLabel">النشطة</p>
      <p class="totalcounter"><span class='translatable'>من </span> ${totalReq}</p>
  </div>
  <div class="New counterCard" data-status="New">
      <p id="newCounter" class="counterCircle">${newNo}</p>
      <p class="counterLabel">الجديدة</p>
      <p class="totalcounter"><span class='translatable'>من </span> ${totalReq}</p>
  </div>
  `
    $("#reqCounter").html("")
    $("#reqCounter").append(content)
}

function renderInvestOptions() {

    // If the categories wrapper doesn't exist yet , create it
    if ($('#customcategories-card-wrapper').length == 0) {
        $('#customSectionBrowser').prepend(`<div id="customcategories-card-wrapper" class='standardCardWrapper'></div>`)
    }

    // Removing the title if it already exists
    $('#customSectionBrowser').find(".sectionTitle").remove()

    // Appending it with the new value
    $('#customSectionBrowser').prepend(`<p id="customSectionTitle" class='sectionTitle'> ${langIsAr() ? "إجراء تحقيق" : "New Investigation"}</p>`)
    $('#customcategories-card-wrapper').empty()

    createCustomSectionCard("ShowAllInvestigations"
        , "https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/InvestigationsImage.jpeg"
        , `${langIsAr() ? "طلبات التحقيق" : "Investigations"}`
        , `${langIsAr() ? "نحن ملتزمون بالشفافية بخصوص نتائج التحقيقات الداخلية. كجزء من التفاني في التحاسب، نقدم تحديثات حول التحقيقات الجارية ونشارك النتائج عند الانتهاء منها. هدفنا هو الحفاظ على الثقة بين أصحاب المصلحة وضمان اتخاذ أي إجراءات ضرورية للتعامل مع القضايا المعنية." : "We are committed to transparency regarding the outcome of internal investigations. As part of our dedication to accountability, we provide updates on ongoing investigations and share findings once they are concluded. Our aim is to maintain trust among our stakeholders and ensure that any necessary actions are taken to address the issues at hand."}`
    )



}

function createCustomSectionCard(id, imageURL, name, description, URL = null) {
    $('#subcategories-card-wrapper').append(`
    <div class="cardItem" id="${id}"  ${URL ?? `onclick="goTo('${URL}')"`}>
    <div class='imageWrapper'>
    <img src="${imageURL}" class='titleImage' alt="Sub-Service Image.jpeg">
    </div>
    <div class='TitleAndDescWrapper'>
    <p class="cardTitle">${name}</p>
    <p class="serviceDescription"> ${description} </p>
    </div>
    </div>
    `)
}

function waitForCustomSectionWrapperRender() {
    if ($('#customSectionBrowser').length > 0) {
        renderInvestOptions();
    } else {
        setTimeout(waitForCustomSectionWrapperRender, 500);
    }
}
