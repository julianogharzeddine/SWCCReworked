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
    if ($('#investigations-ard-wrapper').length > 0) {
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

    $('#investigations-card-wrapper').html("")
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
                <div class="investigation-card">
            <div class="investigationHeader">
                <div class="investigationRefNo">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#0066cc"
                        stroke-width="1.152">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC"
                            stroke-width="0.048"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path
                                d="M15.7281 3.88396C17.1624 2.44407 19.2604 2.41383 20.4219 3.57981C21.5856 4.74798 21.5542 6.85922 20.1189 8.30009L17.6951 10.7333C17.4028 11.0268 17.4037 11.5017 17.6971 11.794C17.9906 12.0863 18.4655 12.0854 18.7578 11.7919L21.1816 9.35869C23.0929 7.43998 23.3329 4.37665 21.4846 2.5212C19.6342 0.663551 16.5776 0.905664 14.6653 2.82536L9.81768 7.69182C7.90639 9.61053 7.66643 12.6739 9.5147 14.5293C9.80702 14.8228 10.2819 14.8237 10.5754 14.5314C10.8688 14.2391 10.8697 13.7642 10.5774 13.4707C9.41376 12.3026 9.4451 10.1913 10.8804 8.75042L15.7281 3.88396Z"
                                fill="#0066cc"></path>
                            <path opacity="0.5"
                                d="M14.4846 9.4707C14.1923 9.17724 13.7174 9.17632 13.4239 9.46864C13.1305 9.76097 13.1296 10.2358 13.4219 10.5293C14.5856 11.6975 14.5542 13.8087 13.1189 15.2496L8.27129 20.1161C6.83696 21.556 4.73889 21.5862 3.57742 20.4202C2.41376 19.2521 2.4451 17.1408 3.8804 15.6999L6.30424 13.2666C6.59657 12.9732 6.59565 12.4983 6.30219 12.206C6.00873 11.9137 5.53386 11.9146 5.24153 12.208L2.81769 14.6413C0.906387 16.56 0.666428 19.6234 2.5147 21.4788C4.36518 23.3365 7.42173 23.0944 9.334 21.1747L14.1816 16.3082C16.0929 14.3895 16.3329 11.3262 14.4846 9.4707Z"
                                fill="#0066cc"></path>
                        </g>
                    </svg>
                    <a href="">${refNo}</a>
                </div>
                <div class="investigationStatus">
                    Medium
                </div>
            </div>
            <hr>
            <div class="investigationBody">
                <p class="subjectTitle">Subject</p>
                <p class="subjectParagraph">
                ${subject}
                </p>
            </div>
            <hr>
            <div class="investigationFooter">
                <div class="authorWrapper">
                    <svg fill="#000000" height="22px" width="22px" viewBox="0 0 24 24" id="edit-user"
                        data-name="Flat Color" xmlns="http://www.w3.org/2000/svg" class="icon flat-color">
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                        <g id="SVGRepo_iconCarrier">
                            <path id="primary"
                                d="M6,7a5,5,0,1,1,5,5A5,5,0,0,1,6,7Zm5,12.61a2,2,0,0,1,.59-1.41l4-4A6.26,6.26,0,0,0,14,14H8a6,6,0,0,0-6,6,2,2,0,0,0,2,2h6a1,1,0,0,0,1-1Z"
                                style="fill: #0066cc000000;"></path>
                            <path id="secondary"
                                d="M20.31,12.29l1.4,1.4a1,1,0,0,1,0,1.4L15.1,21.71a1.05,1.05,0,0,1-.71.29H13a1,1,0,0,1-1-1V19.61a1.05,1.05,0,0,1,.29-.71l6.62-6.61A1,1,0,0,1,20.31,12.29Z"
                                style="fill: #0066cc;"></path>
                        </g>
                    </svg>
                    <div class="graySeparator"></div>
                    <p class="authorName">${creator}</p>
                </div>
                <div class="dateWrapper">
                    <p class="investigationDate">
                    ${new Date(creationDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).split("/").reverse().join("/")}
                    </p>
                </div>
            </div>
        </div>
              
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

