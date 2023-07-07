var dictionary; // definining the dictionary
var baseURL;   // fetching the base URL

$(document).ready(function () {


    // fetching the baseURL to use it in subsequent API Calls

    baseURL = window.location.protocol + '//' + window.location.host + '/';


    // Waiting to successfully fetch the categories to start rendering the Sidebar

    fetchMainCategories()
        .then(function (data) {
            renderSidebar(data)
        })
        .catch(function (error) {
            console.error(error);
        });

    // Appending the listeners to the generated categories and subcategories


    

    $(document).click(function () {
        translate()
    })
    let LSLang = localStorage.getItem('selected_language')


    if (LSLang == null || LSLang == 'undefined') {
        localStorage.setItem('selected_language', 'ar-SA')
    }

    let LSLang1 = localStorage.getItem('selected_language')

    switch (LSLang1) {
        case 'en-US':
            $("a.dd-option label.dd-option-text:contains('Arabic')").click();
            $("a.dd-option label.dd-option-text:contains('English')").click();
            break
        case 'ar-SA':
            $("a.dd-option label.dd-option-text:contains('Arabic')").click();
            break
        case 'fr-FR':
            $("a.dd-option label.dd-option-text:contains('Arabic')").click();
            $("a.dd-option label.dd-option-text:contains('Français')").click();
            break
        default:
            $("a.dd-option label.dd-option-text:contains('Arabic')").click();
            break
    }

    // Translating the Page On Load

    dictionary = [
        { "English": "Investigations Management", "Arabic": "إدارة القضايا و التحقيقات", "French": "Aff. Juridiques" },
        { "English": "Proceed Against Institution", "Arabic": "إجراء ضد مؤسسة", "French": "Procéder Contre Inst." },
        { "English": "Proceed With Institution", "Arabic": "إجراء مع المؤسسة", "French": "Procéder Avec Inst." },
        { "English": "Request Investigation", "Arabic": "إجراء تحقيق", "French": "Demander Enquête" },
        { "English": "Conflict Of Interest Procedure", "Arabic": "إجراء تضارب المصالح", "French": "Procédure Conflit Intérêt" },
        { "English": "Contract Study Procedures", "Arabic": "إجراءات دراسة العقود", "French": "Procédures Étude Contrats" },
        { "English": "Click Here", "Arabic": "إضغط هنا", "French": "Cliquer" },
        { "English": "Conduct Investigation", "Arabic": "إجراء تحقيق", "French": "Mener Enquête" },
        { "English": "Investigation Requests", "Arabic": "طلبات التحقيق", "French": "Demandes D'Enquête" },
        { "English": "Submit Complaint", "Arabic": "تقديم شكوى", "French": "Soumettre Plainte" },
        { "English": "New", "Arabic": "الجديدة", "French": "Nouveau" },
        { "English": "Active", "Arabic": "النشطة", "French": "Actif" },
        { "English": "Completed", "Arabic": "المكتملة", "French": "Terminé" },
        { "English": "Created By", "Arabic": "انشا من قبل", "French": "Créé Par" },
        { "English": "Investigation Status", "Arabic": "حالة التحقيق", "French": "Statut Enquête" },
        { "English": "Subject", "Arabic": "الموضوع", "French": "Sujet" },
        { "English": "out of", "Arabic": "من", "French": "de" },
        { "English": "Status", "Arabic": "الحالة", "French": "Statut" },
        { "English": "Purchase", "Arabic": "طلب شراء", "French": "Achat" },
        { "English": "Sales", "Arabic": "المبيعات", "French": "Ventes" },
        { "English": "Marketing", "Arabic": "التسويق", "French": "Marketing" },
        { "English": "Requisitions", "Arabic": "الطلبات", "French": "Demandes" },
        { "English": "Our Services", "Arabic": "خدماتنا المختلفة", "French": "Nos Services" },
        { "English": "Purchase No", "Arabic": "رقم الطلب", "French": "Numero" },
        { "English": "Today", "Arabic": "اليوم", "French": "Auj" },
        { "English": "Wed", "Arabic": "الأربعاء", "French": "Mer" },
        { "English": "Thu", "Arabic": "الخميس", "French": "Jeu" }
    ];

    // Wait for the card-wrapper div to render successfully

    setTimeout(function () {
        renderLegalServicesCards()
    }, 2000)


    // Creating Notification Icon

    createNotificationIcon()

    // Showing Investigation Options

    $(document).on('click', '#createInvestigationButton', function () {
        $("[name='showTalabatTahkik hiddenButton']").trigger('click')

        // Rendering Investigation buttons which shows the actions that can be taken
        renderInvestOptions()
    })

    // Showing all the investigations in the custom cards

    $(document).on('click', '#showAllInvestigations', function () {
        $("[name='showAllInvestigations hiddenButton']").trigger('click')

        // Creating the request counters
        createReqCounters()

        // Hiding the custom cards

        $('#card-wrapper').css('visibility', 'visible')
        $('#card-wrapper').css('height', 'fit-content')

        renderInvestCards()

    })

    // Hiding everything else when showing tasks

    $('[name="MyTasks ButtonNoBorder"]').click(function () {
        $('#card-wrapper').css('visibility', 'hidden')
        $('#card-wrapper').css('height', '0')
    })

    $('[name="Text Box"]').on("input", function () {

        setTimeout(function () {
            renderInvestCards()
        }, 1000)

    })

    $(document).on('click', '#bellicon', function () {
        $('#dropdownContent').toggle()
    });


})

function renderInvestOptions() {

    $('#InvestigationCards').html("")
    $('#InvestigationCards').append(`
  <div class="cardItem" id='showAllInvestigations'>
      <img src="https://cdn.jsdelivr.net/gh/nourkhansa20/CustomFiles@main/gavel-lawyer-books-isolated-white-justice-law-legal-concept-d-illustration-91106772-transformed.webp" class='titleImage'>
      <p class="cardTitle translatable">طلبات التحقيق</p>
  </div>
  <div class="cardItem" onclick="goTo('https://srv-k2five/Runtime/Runtime/Form/Submit.Form/')">
      <img src="https://cdn.jsdelivr.net/gh/nourkhansa20/CustomFiles@main/2000x1000_legal2.jpg" class='titleImage'>
      <p class="cardTitle translatable">إجراء تحقيق</p>
  </div>
  <div class="cardItem"  onclick="goTo('https://srv-k2five/Runtime/Runtime/Form/InitialForm.Form/')">
      <img src="https://cdn.jsdelivr.net/gh/nourkhansa20/CustomFiles@main/how-to-file-a-complaint.jpg" class='titleImage'>
      <p class="cardTitle translatable">تقديم شكوى</p>
  </div>
  
  `)
}


// Dynamically rendering the tasks

function createNotificationIcon() {
    $('.taskDD').remove()

    // Fetching the tasks from the Endpoint 

    $.ajax({
        type: 'GET',
        url: `${baseURL}api/workflow/v1/Tasks`,
        dataType: 'json',
        crossDomain: false,
        beforeSend: function (xhr) {
            xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(unescape(encodeURIComponent("sp_admin" + ':' + "P@ssw0rd"))));
            xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
            xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
        },
        success: function (json_data) {
            let taskArray = json_data.tasks.filter((task) => {
                return task
            })
            console.log(taskArray)
            renderTasks(taskArray)
        },
        error: function () {
            alert('Failed to Load Tasks !');
        }
    })

}

function renderTasks(tasks) {

    const taskCount = tasks.length;

    $('body').append(`
<div class="taskDD">
    <div>
        <div id="notificationCounter">
            <p id="redCircle">${taskCount}</p>
        </div>
        <img id="bellicon" src="https://srv-k2five/designer/Image.ashx?ImID=170283">
    </div>
    <div id="dropdownContent">
    </div>
</div>`)

    tasks.map((task) => {

        const dateObj = new Date(task.taskStartDate);
        const options = { weekday: 'long' };
        const dayName = new Intl.DateTimeFormat('en-US', options).format(dateObj);
        const firstThreeDigits = dayName.slice(0, 3);


        $('#dropdownContent').append(`
      <a href = "${task.viewFlowURL}" target = "_self" >
        <div class="date-icon ">${firstThreeDigits}</div>
        <div class="task-details">
          <h4>${task.activityName}</h4>
          <p>${task.serialNumber}</p>
        </div>
      </a>
`)
    })

}

// Redirection function

function goTo(href) {
    window.open(href, "_self")
}


function renderSidebar(data) {

    $("[name='Sidebar']").append(`<div id="SidebarCategoryWrapper"></div>`)
    data.map((category) => {

        const categoryID = category.ID

        fetchSubCategories(categoryID)
            .then(function(data) {

                console.log(data);

                if (data === []) {
                    $("#SidebarCategoryWrapper").append(
                        `<div class="categoryItemWrapper" >
                        <div class="categoryItem" data-index="${category.ID}">
                  <img src='${category.CategoryImageURL}'>
                  <p class='categoryName'>${category.CategoryNameAr}</p>
                </div>
                </div>`
                    )
                } else {
                    const subCategoriesHTML = data.map((subCategory) => {
                        return `<div class="subcategoryItem" data-index="${subCategory.ID}">
                                <p class='subcategoryName'>${subCategory.SubCategoryNameAr}</p>
                              </div>`;
                    }).join('');

                    $("#SidebarCategoryWrapper").append(
                        `<div class="categoryItemWrapper">
                        <div class="categoryItem">
                        <img src='${category.CategoryImageURL}'>
                        <p class='categoryName'>${category.CategoryNameAr}</p>
                      </div>
                      <div class="subcategoriesWrapper">${subCategoriesHTML}</div>
                      </div>
                      `
                    );
                }
            })
            .catch(function (error) {
                console.error(error);
            });



    })
}


function fetchMainCategories() {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'GET',
            url: 'https://srv-k2five/api/odatav4/v4/Categories_SMO',
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
                reject('Failed to Load Tasks!');
            }
        });
    });
}

function fetchSubCategories(categoryID) {
    return new Promise(function (resolve, reject) {
        $.ajax({
            type: 'GET',
            url: 'https://srv-k2five/api/odatav4/v4/SubCategories_SMO',
            dataType: 'json',
            crossDomain: false,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Basic ' + window.btoa(unescape(encodeURIComponent("sp_admin" + ':' + "P@ssw0rd"))));
                xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
                xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
            },
            success: function (json_data) {
                const filtered = json_data.value.filter((subCategory) => {
                    return subCategory.CategoryID === categoryID
                })

                console.log('The filtered subcategory' , filtered)
                resolve(filtered);
            },
            error: function () {
                reject('Failed to Load Subcategories!');
            }
        });
    });
}

function renderInvestCards() {
    var cardWrapper = $("#card-wrapper");
    if (cardWrapper.length === 0) {
        var gridBody = $('div[name="RequestsInventory"]');
        $('<div id="card-wrapper"></div>').insertAfter(gridBody);
        cardWrapper = $("#card-wrapper");
    }

    cardWrapper.html("")
    var rowObjects = fetchRowValues();


    rowObjects.forEach(function (row) {

        var creatorName = row[0] !== undefined ? row[0] : '';
        var creationDate = row[1] !== undefined ? row[1] : '';
        var investStatus = row[2] !== undefined ? row[2] : '';
        var subject = row[3] !== undefined ? row[3] : '';
        var investNo = row[4] !== undefined ? row[4] : '';
        var statusColor = row[5] !== undefined ? row[5] : '';

        cardWrapper.append(`
        <div class="cardItem">
          <div class="cardHeader">
          <div class="investNoStatusWrap">
          <div class="status" style="background-color: ${statusColor};"></div>
            <div class="investNo"><a href='https://srv-k2five/Runtime/Runtime/Form/RO.Form/?RefNo=${investNo}'>${investNo}</a></div>
          </div>
          <div class='dateWrapper'> 
          <div class="date">${creationDate}</div>
          <img src='https://srv-k2five/Designer/Image.ashx?ImID=110252' />
          </div>
          </div>
          <div class="cardBody">
            <div class="card-rows">
              <p class="reqCreator labelVal">${creatorName}</p>
              <p class="reqCreatorLabel labelTitle translatable">انشا من قبل</p>
            </div>
            <div class="card-rows">
              <p class="reqCreator labelVal">${investStatus}</p>
              <p class="reqCreatorLabel labelTitle translatable">حالة التحقيق</p>
            </div>
            <div class="card-rows">
              <p class="reqSubject labelVal">${subject}</p>
              <p class="reqSubjectLabel labelTitle translatable">الموضوع</p>
            </div>
          </div>
        </div>
      `);
    });
}

function fetchRowValues() {

    let rowObjects = []

    let rows = $('div[name="RequestsInventory"]').find('.grid-body-content').find('.grid-content-table').find('tbody').find('tr')

    rows.each(function () {

        let tds = $(this).find('td').find('.runtime-list-item-wrap')
        let emptyObj = {}
        let index = 0

        tds.each(function () {

            if ($(this).text() == ".") {
                emptyObj[index] = $(this).css("background-color")
            } else {
                emptyObj[index] = $(this).text()
            }

            index++
        })

        rowObjects.push(emptyObj)
    })

    return rowObjects
}

function fetchReqStatuses() {

    let activeNo = $("span[name='Active']").text()
    let newNo = $("span[name='New']").text()
    let completedNo = $("span[name='Completed']").text()

    $("span[name='Active']").css("visibility", "hidden !important");
    $("span[name='New']").css("visibility", "hidden !important");
    $("span[name='Completed']").css("visibility", "hidden !important");


    return [activeNo, newNo, completedNo]
}

function createReqCounters() {

    let [activeNo, newNo, completedNo] = fetchReqStatuses()
    let totalcounter = $("[name='Count Data Label']").text();
    let content = `
  <div class="Complete counterCard">
      <p id="completeCounter" class="counterCircle">${completedNo}</p>
      <p class="counterLabel translatable">المكتملة</p>
      <p class="totalcounter"><span class='translatable'>من </span> ${totalcounter}</p>
  </div>
  <div class="Active counterCard">
      <p id="activeCounter" class="counterCircle">${activeNo}</p>
      <p class="counterLabel translatable">النشطة</p>
      <p class="totalcounter"><span class='translatable'>من </span> ${totalcounter}</p>
  </div>
  <div class="New counterCard">
      <p id="newCounter" class="counterCircle">${newNo}</p>
      <p class="counterLabel translatable">الجديدة</p>
      <p class="totalcounter"><span class='translatable'>من </span> ${totalcounter}</p>
  </div>
  `
    $("#reqCounter").html("")
    $("#reqCounter").append(content)
}

function renderLegalServicesCards() {
    $('#legalservices-card-wrapper').html("")
    $('#legalservices-card-wrapper').append(`
    <div class="cardItem">
    <img src="https://cdn.jsdelivr.net/gh/nourkhansa20/CustomFiles@main/379143894_750x422.jpg" class='titleImage'>
    <p class="cardTitle translatable">إجراء ضد مؤسسة</p>
</div>
<div class="cardItem">
    <img src="https://cdn.jsdelivr.net/gh/nourkhansa20/CustomFiles@main/court-inquest-adobestock_184306582.jpg" class='titleImage'>
    <p class="cardTitle translatable">إجراء مع المؤسسة</p>
</div>
<div class="cardItem" id='createInvestigationButton'>
    <img src="https://cdn.jsdelivr.net/gh/nourkhansa20/CustomFiles@main/0-6.jpg" class='titleImage'>
    <p class="cardTitle translatable">إجراء تحقيق</p></div>
<div class="cardItem">
    <img src="https://cdn.jsdelivr.net/gh/nourkhansa20/CustomFiles@main/conflict-of-interest-25e7ab7068414ab080d7563821681049.jpg" class='titleImage'>
    <p class="cardTitle translatable">إجراء تضارب المصالح</p></div>
<div class="cardItem">
    <img src="https://cdn.jsdelivr.net/gh/nourkhansa20/CustomFiles@main/pexels-photo.jpg" class='titleImage'>
    <p class="cardTitle translatable">إجراءات دراسة العقود</p></div>
  `)
}

function waitForLegalWrapperRender() {
    if ($("[name='LegalServicesDL']").length > 0) {
        // Call your function here
        renderLegalServicesCards()
    } else {
        // Retry after a delay
        setTimeout(waitForLegalWrapperRender, 200);
    }
}

function translate() {
    let LSLang = localStorage.getItem('selected_language')
    let targetLang = ""

    switch (LSLang) {
        case 'en-US':
            targetLang = 'English'
            $('[name="Sidebar"]').css('right', '')
            $('[name="Sidebar"]').css('left', '0')
            $('.runtime-form').css('left', '')
            $('.runtime-form').css('left', '20%')
            $('.counterCard').css('flex-direction', 'row-reverse')
            $('.dateWrapper').css('flex-direction', 'row-reverse')
            $('.card-rows').css('flex-direction', 'row-reverse')
            $('.cardHeader').css('flex-direction', 'row')
            $('.investNoStatusWrap').css('flex-direction', 'row')
            $('#legalservices-card-wrapper').css('direction', 'ltr')
            $('#card-wrapper').css('direction', 'ltr')
            $('.taskDD a').css('flex-direction', 'row')
            $('.task-details p').css({
                'text-align': 'left',
                'direction': 'rtl'
            })
            $(".task-details h4").css("text-align", "left")
            break
        case 'ar-SA':
            targetLang = 'Arabic'
            $('[name="Sidebar"]').css('left', '')
            $('[name="Sidebar"]').css('right', '0')
            $('[name="Sidebar"]').css('left', '')
            $('.runtime-form').css('left', '5%')
            $('.counterCard').css('flex-direction', 'row-reverse')
            $('.dateWrapper').css('flex-direction', 'row')
            $('.card-rows').css('flex-direction', 'row-reverse')
            $('.cardHeader').css('flex-direction', 'row')
            $('.investNoStatusWrap').css('flex-direction', 'row')
            $('#legalservices-card-wrapper').css('direction', 'rtl')
            $('#card-wrapper').css('direction', 'rtl')
            $('.taskDD a').css('flex-direction', 'row-reverse')
            $('.task-details p').css({
                'text-align': 'right',
                'direction': 'ltr'
            })
            $(".task-details h4").css("text-align", "right")
            break
        case 'fr-FR':
            targetLang = 'French'
            $('[name="Sidebar"]').css('right', '')
            $('[name="Sidebar"]').css('left', '0')
            $('.runtime-form').css('left', '')
            $('.runtime-form').css('left', '20%')
            $('.counterCard').css('flex-direction', 'row-reverse')
            $('.card-rows').css('flex-direction', 'row-reverse')
            $('.cardHeader').css('flex-direction', 'row')
            $('.dateWrapper').css('flex-direction', 'row')
            $('#legalservices-card-wrapper').css('direction', 'ltr')
            $('#card-wrapper').css('direction', 'ltr')
            $('.taskDD a').css('flex-direction', 'row')
            $('.task-details p').css({
                'text-align': 'left',
                'direction': 'rtl'
            })
            $(".task-details h4").css("text-align", "left")
            break
    }

    let toTranslate = $('.translatable')

    toTranslate.each(function () {
        $(this).text(getFromDictionary(($(this).text().trim()), targetLang))
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

