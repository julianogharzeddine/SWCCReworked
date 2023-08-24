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

    /* When clicking on a sidebar tile , the following will be executed , they are being configured from here
     to  provide maximum flexibility since it is possible the sidebar would have a different behavior in another 
     form */

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

    // Showing Investigation Options
    $(document).on('click', '#CreateInvestigationSubOption', function () {
        waitForCustomSectionWrapperRender()
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

    // Showing all the investigations in the custom cards
    $(document).on('click', '#ShowAllInvestigations', function () {

        initiateFetchInvestigations()

        // $("[name='ShowRequests hiddenButton']").trigger("click")

    })

    // Counter cards listeners 
    $(document).on('input', '[name="SearchBox"]', function () {
        searchKeyword = $(this).val()
        initiateFetchInvestigations()
    })


    /* On page load , we may have a categoryID parameter passed in the URL 
       We cannot trigger the subcategory fetching immediately on page load because the sidebar 
       may note have been rendered yet , so we wait for the sidebar and then we trigger the
       category seleciton
    */
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

        const subCategoryID = item.ID ?? ""
        const subCategoryName = langIsAr() ? item.SubCategoryNameAR : item.SubCategoryNameEN
        const subCategoryDesc = langIsAr() ? item.SubCategoryDescriptionAR : item.SubCategoryDescriptionEN
        const subCategoryImageURL = item.SubCategoryImageURL ?? ""
        const subCategoryURL = item.SubCategoryURL ?? ""
        const isActive = isTrue(item.IsActive)
        const isClickable = isTrue(item.IsClickable)
        const subCatJSID = item.JavaScriptID ?? ""
        const foundMatch = (item.CategoryID === categoryID)

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
        matchingElements?.click()
    }
    else {
        $(`.categoryItemWrapper[data-cat="1"]`)?.click()

    }

}

function waitForSidebarRender() {
    if ($('#SidebarContentWrapper').length > 0) {
        checkTargetCategory()
    } else {
        setTimeout(waitForSidebarRender, 500);
    }
}

/* ---------------------------------------  RENDERING CUSTOM SECTION CARDS ----------------------------------------- */

function waitForCustomSectionWrapperRender() {
    if ($('#customSectionBrowser').length > 0) {
        renderInvestOptions();
    } else {
        setTimeout(waitForCustomSectionWrapperRender, 500);
    }
}

function renderInvestOptions() {

    // If the custom categories wrapper doesn't exist yet , create it
    if ($('#customcategories-card-wrapper').length == 0) {
        $('#customSectionBrowser').prepend(`<div id="customcategories-card-wrapper" class='standardCardWrapper'></div>`)
    }

    // Removing the title if it already exists
    $('#customSectionBrowser').find(".sectionTitle").remove()

    // Appending it with the new value
    $('#customSectionBrowser').prepend(`<p id="customSectionTitle" class='sectionTitle'> ${langIsAr() ? "إجراء تحقيق" : "New Investigation"}</p>`)
    $('#customcategories-card-wrapper').empty()


    // Generating the custom cards by providing id , image , title , and

    createCustomSectionCard("ShowAllInvestigations"
        , "https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/InvestigationsImage.jpeg"
        , `${langIsAr() ? "طلبات التحقيق" : "Investigations"}`
        , `${langIsAr() ? "نحن ملتزمون بالشفافية بخصوص نتائج التحقيقات الداخلية. كجزء من التفاني في التحاسب، نقدم تحديثات حول التحقيقات الجارية ونشارك النتائج عند الانتهاء منها. هدفنا هو الحفاظ على الثقة بين أصحاب المصلحة وضمان اتخاذ أي إجراءات ضرورية للتعامل مع القضايا المعنية" : "We are committed to transparency regarding the outcome of internal investigations. We provide updates on ongoing investigations and share findings once they are concluded"}`
    )
    createCustomSectionCard("CreateNewInvestigation"
        , "https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/CreateInvestigationImage.jpg"
        , `${langIsAr() ? "إجراء طلب تحقيق" : "New Investigation"}`
        , `${langIsAr() ? "تلتزم منظمتنا بالحفاظ على بيئة عمل شفافة وأخلاقية. في حالة وجود أي مخاوف أو انتهاكات محتملة للسياسات، نقوم بإجراء تحقيقات داخلية دقيقة لضمان نزاهة عملياتنا. يعمل فريقنا المخصص بجدية للكشف عن الحقيقة واتخاذ الإجراءات المناسبة إذا تم تحديد أي سلوك غير أخلاقي" : "In the event of any concerns or potential violations of policies, our dedicated team works diligently to uncover the truth and take appropriate actions if misconduct is identified"}`
        , "https://srv-k2five/Runtime/Runtime/Form/Submit.Form/"
    )
    createCustomSectionCard("CreateComplaint"
        , "https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/CreateComplaintImage.jpg"
        , `${langIsAr() ? "تقديم شكوى" : "Submit Complaint"}`
        , `${langIsAr() ? "إذا كنت قد شهدت أو تعرضت لأي سلوك يتعارض مع قيم أو سياسات منظمتنا، فنحن نشجعك على تقديم شكوى. سيتم التعامل مع مخاوفك بجدية، وسيقوم فريق التحقيق لدينا بتقييم الموضوع بدقة. يمكنك تقديم شكواك من خلال قنواتنا المخصصة لضمان سرية البيانات وحل المشكلة بسرعة" : "If you have witnessed or experienced any behavior that goes against our organization's values or policies, we encourage you to submit a complaint"}`
        , "https://srv-k2five/Runtime/Runtime/Form/InitialForm.Form/"
    )

    scaleText()


}

function createCustomSectionCard(id, imageURL, name, description, URL = null) {
    $('#customcategories-card-wrapper').append(`
    <div class="cardItem" id="${id}"  ${URL !== null ? `onclick="goTo('${URL}')"` : ""}>
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


/* ---------------------------------------  RENDERING INVESTIGATIONS SECTION ----------------------------------------- */




function initiateFetchInvestigations() {

    // Creating the investigation cards
    fetchInvestigations()
        .then(function (data) {
            waitForInvestWrapperRender(data)
            waitForCounterWrapperRender(data)
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
                console.log(json_data)
                resolve(json_data.value);
            },
            error: function () {
                reject('Failed to Load Investigations!');
            }
        });
    });
}

// Wait for the Card Wrapper
function waitForInvestWrapperRender(data) {
    if ($('#investigations-card-wrapper').length > 0) {
        renderInvestCards(data);
    } else {
        setTimeout(waitForInvestWrapperRender, 500);
    }
}

// Wait for the Req Counter Wrapper
function waitForCounterWrapperRender(data) {
    if ($('#reqCounter').length > 0) {
        renderCounterButtons(data)
    } else {
        setTimeout(waitForCounterWrapperRender, 500);
    }
}



// Rendering Investigation Cards
function renderInvestCards(data) {

    $('#investigations-card-wrapper').empty()
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
                $('#investigations-card-wrapper').append(`
                <div class="investigation-card"><div class="investigationHeader "><div class="investigationRefNo"><img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/refno-link.svg" alt="Ref. No"><a href="">${refNo}</a></div>
                   <div class="investigationStatus  ${redStatus.includes(status) ? "cardStatusNew" : (
                    orangeStatus.includes(status) ? "cardStatusPending" : (
                        greenStatus.includes(status) ? "cardStatusComplete" : "cardStatusNew"
                    )
                )
               }">Medium</div></div><hr><div class="investigationBody"><p class="subjectTitle">Subject</p><p class="subjectParagraph">${subject}</p></div><hr><div class="investigationFooter"><div class="authorWrapper"><img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/investigation-creator.svg" alt="Created By"><div class="graySeparator"></div><p class="authorName">${creator}</p></div><div class="dateWrapper"><p class="investigationDate">${new Date(creationDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).split("/").reverse().join("/")}</p></div></div></div>
`);
                filteredResults++
            }
        }

    })

    if (filteredResults === 0) $('#noInvestigationsFound').text("No Items Found")
    else $('#noInvestigationsFound').text("")

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
