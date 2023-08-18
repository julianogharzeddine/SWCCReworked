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

    // Add click event listener to each counterCard

    $(document).on("click", ".counterCard", function () {

        // Remove 'Darker' class from all counterCard divs

        $('.counterCard').removeClass('Darker');

        // Add 'Darker' class to the clicked counterCard div

        $(this).addClass('Darker');
    })


    // Translating the Page On Load

    dictionary = [
        { "English": "", "Arabic": "", "French": "" },

    ];




    // Showing Investigation Options

    $(document).on('click', '#createInvestigationButton', function () {
        // Rendering Investigation buttons which shows the actions that can be taken
        renderInvestOptions()
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


    $(document).on('click', '.counterCard', function () {

        investStatus = $(this).data("status")
        initiateFetchInvestigations()

    })


    // Counter cards listeners 

    $(document).on('input', '[name="SearchBox"]', function () {
        searchKeyword = $(this).val()
        initiateFetchInvestigations()
    })


    // Counter cards listeners 

    $(document).on('click', '.categoryItem', function () {


        let categoryName = $(this).find('.categoryName').text()
        let categoryID = $(this).data("cat")
        let hasSubcategories = $(this).data("hassubcategories")

        console.log(hasSubcategories)
        if (hasSubcategories) {
            fetchSubCategoriesJoin()
                .then(function (data) {
                    renderSubCategoryCards(data, categoryName, categoryID)
                })
                .catch(function (error) {
                    console.error(error);
                });
        }

    })

    $(document).on('click', '.sectionBrowser .cardItem', function () {
        var selectionIndex = $(this).data("subcat")
        var targetRadio = $('[name="SubcategoriesDropdown"]').find(`input[type='radio'][value='${selectionIndex}']`);
        targetRadio.trigger('click')
    })

    /* 
        fetchSubCategoriesJoin()
            .then(function (data) {
                renderSubCategoryCards(data, "إدارة القضايا والتحقيقات", 1)
            })
            .catch(function (error) {
                console.error(error);
            });
     */

})

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

// Wait for the Card Wrapper

function waitForInvestWrapperRender(data) {
    if ($('#card-wrapper').length > 0) {
        renderInvestCards(data);
    } else {
        setTimeout(waitForInvestWrapperRender, 500);
    }
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

        console.log(targetArray)

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



// Fetching subcategories

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

    $("#subOptions").find('.sectionBrowserTitle').remove()
    $("#subOptions").prepend(`<p class="sectionBrowserTitle">إجراء تحقيق</p>`)

    $('#InvestigationCards').html("")
    $('#InvestigationCards').append(`
  <div class="cardItem" id='showAllInvestigations'>
      <img src="https://cdn.jsdelivr.net/gh/nourkhansa20/CustomFiles@main/gavel-lawyer-books-isolated-white-justice-law-legal-concept-d-illustration-91106772-transformed.webp" class='titleImage'>
      <p class="cardTitle">طلبات التحقيق</p>
  </div>
  <div class="cardItem" onclick="goTo('https://srv-k2five/Runtime/Runtime/Form/Submit.Form/')">
      <img src="https://cdn.jsdelivr.net/gh/nourkhansa20/CustomFiles@main/2000x1000_legal2.jpg" class='titleImage'>
      <p class="cardTitle">إجراء تحقيق</p>
  </div>
  <div class="cardItem"  onclick="goTo('https://srv-k2five/Runtime/Runtime/Form/InitialForm.Form/')">
      <img src="https://cdn.jsdelivr.net/gh/nourkhansa20/CustomFiles@main/how-to-file-a-complaint.jpg" class='titleImage'>
      <p class="cardTitle">تقديم شكوى</p>
  </div>
  
  `)
}

// Rendering the SubCategory Cards

function renderSubCategoryCards(data, categoryName, categoryID) {

    $("#sectionBrowserLandingTitle").remove()
    $('#sectionBrowser').prepend(`<p class="sectionBrowserLandingTitle">${categoryName}</p>`)
    $('#subcategories-card-wrapper').html("")

    data.map((item) => {

        let subCategoryID = item.ID
        let subCategoryName = langIsAr() ? item.SubCategoryNameAR :  item.SubCategoryNameEN
        let subCategoryDesc = langIsAr() ? item.SubCategoryDescriptionAR :  item.SubCategoryDescriptionEN
        let subCategoryImageURL = item.SubCategoryImageURL
        let subCategoryURL = item.SubCategoryURL
        let isActive = isTrue(item.IsActive)
        let isClickable = isTrue(item.IsClickable)
        let subCatJSID = item.JavaScriptID

        if (item.CategoryID === categoryID && isActive) {
            $('#subcategories-card-wrapper').append(`
 <div class="cardItem subcategoryItem" id="${subCatJSID }" data-subcat="${subCategoryID}" ${isClickable ? `onclick="goTo('${subCategoryURL}')"` : ""}>
 <div class='imageWrapper'>
 <img src="${subCategoryImageURL}" class='titleImage' alt="Sub-Service Image.jpeg">
 </div>
 <div class='TitleAndDescWrapper'>
 <p class="cardTitle">${subCategoryName}</p>
 <p class="serviceDescription"> ${subCategoryDesc} </p>
 </div>
 </div>
 `
            )

        }

    })

}


function getFromDictionary(text, toLanguage) {
    for (var i = 0; i < dictionary.length; i++) {

        var entry = dictionary[i];

        if (entry.English === text) return entry[toLanguage];
        if (entry.Arabic === text) return entry[toLanguage];
        if (entry.French === text) return entry[toLanguage];

    }

    return 'Translation not found';
}

