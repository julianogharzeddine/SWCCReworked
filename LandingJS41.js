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


        // Creating the investigation cards

        fetchInvestigations()
            .then(function (data) {
                waitForInvestWrapperRender(data)
            })
            .catch(function (error) {
                console.error(error);
            });

    })


    // Counter cards listeners 


    $(document).on('click', '.counterCard', function () {

        investStatus = $(this).data("status")

        console.log(investStatus)

        // Creating the investigation cards

        fetchInvestigations()
            .then(function(data) {
                waitForInvestWrapperRender(data)
            })
            .catch(function(error) {
                console.error(error);
            });

    })



})




// Redirection function

function goTo(href) {
    window.open(href, "_self")
}


// Wait for the Card Wrapper

function waitForInvestWrapperRender(data) {
    if ($('#card-wrapper').length > 0) {
        renderInvestCards(data, investStatus, searchKeyword);
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

function renderInvestCards(data, investStatus, keyword) {

    $('#card-wrapper').html("")

    data.map((investigation) => {

        let status = investigation.Status
        let refNo = investigation.RefNo
        let creationDate = investigation.CreatedOn
        let creator = investigation.CreatedBy
        let subject = investigation.InvestigationSubject

        let containsKeyword =
            refNo.toLowerCase().includes(keyword.toLowerCase()) ||
            creationDate.toLowerCase().includes(keyword.toLowerCase()) ||
            creator.toLowerCase().includes(keyword.toLowerCase()) ||
            subject.toLowerCase().includes(keyword.toLowerCase());

        let targetArray = []

        switch (investStatus) {
            case ("Completed"): targetArray = greenStatus
            case ("Active"): targetArray = orangeStatus
            case ("New"): targetArray = redStatus
            default: targetArray = []

        }



        if (containsKeyword) {
            if (investStatus = "All") {
                $('#card-wrapper').append(`<div class="cardItem"><div class="cardHeader"><div class="investNoStatusWrap"><div class="status" style="background-color: ${redStatus.includes(status) ? "red" : (orangeStatus.includes(status) ? "orange" : (greenStatus.includes(status) ? "green" : "red"))};"></div><div class="investNo"><a href='https://srv-k2five/Runtime/Runtime/Form/RO.Form/?RefNo=${refNo}'>${refNo}</a></div></div><div class='dateWrapper'><div class="date">${new Date(creationDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).split("/").reverse().join("/")}</div><img src='${dateIconURL}' /></div></div><div class="cardBody"><div class="card-rows"><p class="reqCreator labelVal">${creator}</p><p class="reqCreatorLabel labelTitle translatable">انشا من قبل</p></div><div class="card-rows"><p class="reqCreator labelVal">${status}</p><p class="reqCreatorLabel labelTitle translatable">حالة التحقيق</p></div><div class="card-rows"><p class="reqSubject labelVal">${subject}</p><p class="reqSubjectLabel labelTitle translatable">الموضوع</p></div></div></div>`);
            } else {
                if (targetArray.includes(status)) {
                    $('#card-wrapper').append(`<div class="cardItem"><div class="cardHeader"><div class="investNoStatusWrap"><div class="status" style="background-color: ${redStatus.includes(status) ? "red" : (orangeStatus.includes(status) ? "orange" : (greenStatus.includes(status) ? "green" : "red"))};"></div><div class="investNo"><a href='https://srv-k2five/Runtime/Runtime/Form/RO.Form/?RefNo=${refNo}'>${refNo}</a></div></div><div class='dateWrapper'><div class="date">${new Date(creationDate).toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }).split("/").reverse().join("/")}</div><img src='${dateIconURL}' /></div></div><div class="cardBody"><div class="card-rows"><p class="reqCreator labelVal">${creator}</p><p class="reqCreatorLabel labelTitle translatable">انشا من قبل</p></div><div class="card-rows"><p class="reqCreator labelVal">${status}</p><p class="reqCreatorLabel labelTitle translatable">حالة التحقيق</p></div><div class="card-rows"><p class="reqSubject labelVal">${subject}</p><p class="reqSubjectLabel labelTitle translatable">الموضوع</p></div></div></div>`);
                }
            }
        }

    })

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
      <p class="counterLabel translatable">المكتملة</p>
      <p class="totalcounter"><span class='translatable'>من </span> ${totalReq}</p>
  </div>
  <div class="Active counterCard" data-status="Active">
      <p id="activeCounter" class="counterCircle">${activeNo}</p>
      <p class="counterLabel translatable">النشطة</p>
      <p class="totalcounter"><span class='translatable'>من </span> ${totalReq}</p>
  </div>
  <div class="New counterCard" data-status="New">
      <p id="newCounter" class="counterCircle">${newNo}</p>
      <p class="counterLabel translatable">الجديدة</p>
      <p class="totalcounter"><span class='translatable'>من </span> ${totalReq}</p>
  </div>
  `
    $("#reqCounter").html("")
    $("#reqCounter").append(content)
}


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


function fetchReqStatuses() {

    let activeNo = $("span[name='Active']").text()
    let newNo = $("span[name='New']").text()
    let completedNo = $("span[name='Completed']").text()

    $("span[name='Active']").css("visibility", "hidden !important");
    $("span[name='New']").css("visibility", "hidden !important");
    $("span[name='Completed']").css("visibility", "hidden !important");


    return [activeNo, newNo, completedNo]
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
            $('.taskDD').css('left', '72%')
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
            $('.taskDD').css('left', '20%')
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
            $('.taskDD').css('right', '72%')
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

