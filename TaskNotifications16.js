var baseURL;   // fetching the base URL
var sortingOrder = ""

$(document).ready(function () {

    // Fetching the baseURL to use it in subsequent API Calls
    if (!baseURL) baseURL = window.location.protocol + '//' + window.location.host + '/';

    // Creating the notification Icon
    createNotificationIcon()

    // On click listener for the notification icon
    $(document).on('click', '#bellicon', function () {
        $('#taskDDMainWrapper').toggle()
    });

    // Click behaviors for the sorting icons 
    $(document).on('click', '.sortingIcon', function () {
        let iconID = $(this).attr("id")
        if (iconID == "sortAscending" && sortingOrder != "ASC") setOrderAscending()
        else if (iconID == "sortDescending" && sortingOrder != "DESC") setOrderDescending()

    });

    // Click behaviors for the sorting icons 
    $(document).on('input', '#taskSearchKeyword', function () {
        createNotificationIcon()
    });

})

// Dynamically rendering the tasks

function createNotificationIcon() {

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

            renderTasks(taskArray)
        },
        error: function () {
            alert('Failed to Load Tasks !');
        }
    })

}

function renderTasks(tasks) {

    let taskCount = tasks.length

    // If no tasks were found , display the notice saying so
    if (taskCount == 0) {
        setNoResultsFound()
        return
    }


    // If the taskDD already exists we don't recreate its structure again , we would only fill the dropdownContent
    let checkIfExists = $('.taskDD')

    if (checkIfExists.length == 0) {
        createTaskDDStructure(tasks)
    }

    // Clearing the content of the tasks in case it already contains data
    $('#dropdownContent').html("")

    const filteredTasks = sortByDateAndKeyword(tasks)


    // If no tasks fit the criteria , we display the notice to the user
    if (filteredTasks.length == 0) {
        setNoResultsFound()
        return
    }

    filteredTasks.map((task) => {
        const dateObj = new Date(task.taskStartDate);
        const options = { weekday: 'long' };
        let dayName;

        if (currentLanguage === "AR") {
            dayName = new Intl.DateTimeFormat('ar-EG', options).format(dateObj); // Use the appropriate locale for Arabic
        } else {
            dayName = new Intl.DateTimeFormat('en-US', options).format(dateObj);
            dayName = dayName.slice(0, 3);
        }

        $('#dropdownContent').append(`
        <a href="${task.formURL}" target="_self">
            <div class="date-icon">${dayName}</div>
            <div class="task-details">
                <h4>${task.activityName}</h4>
                <p>${task.serialNumber}</p>
                <p class='taskDate'>${task.taskStartDate}</p>
            </div>
        </a>
    `);
    });


    translateNotifications()

}

function createTaskDDStructure(tasks) {

    let taskCount = tasks.length

    $('body').append(`
    <div class="taskDD">
        <div id="iconWrapper">
            <div id="notificationCounter">
                <p id="redCircle">${taskCount}</p>
            </div>
            <img id="bellicon" src="https://srv-k2five/designer/Image.ashx?ImID=170283" alt="Bell Icon">
        </div>
      
        <div id="taskDDMainWrapper">
        <div id="taskToolbarWrapper">
            <div id="taskSearchWrapper" class="filterOptionWrapper">
                <span> Search </span>
                <input type="text" id="taskSearchKeyword">
            </div>
            <div id="taskDateWrapper" class="filterOptionWrapper">
                <span> Date </span>
                <div class="sortingIconsWrapper">
                <img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/sort-ascending.png" id="sortAscending" class="sortingIcon" alt="ASC">
                </div>
                <div class="sortingIconsWrapper">
                <img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/sort-descending.png" id="sortDescending" class="sortingIcon" alt="DESC">
                </div>
            </div>
        </div>
        <div id="dropdownContent">
        </div>
        </div>
    
    </div>`)
}

function translateNotifications() {
    let taskDD = $('.taskDD')

    currentLanguage == "AR" ? (
        taskDD.css('left', '20%')
        , $("#bellicon").css("float", "right")
        , $('.taskDD a').css('flex-direction', 'row')
        , $('.task-details p').css('text-align', 'right')
        , $(".taskDD").css("flex-direction", "row-reverse")
    )
        :
        (
            $("#bellicon").css("float", "left")
            , $('.taskDD a').css('flex-direction', 'row')
            , $('.task-details p').css('text-align', 'left')
            , $(".taskDD").css("flex-direction", "row-reverse")
            , $(".taskDD").css('left', '45%')
        )
}

function sortByDateAndKeyword(tasks) {

    const searchKeyword = $("#taskSearchKeyword").val().trim();

    // Filter tasks by search keyword on relevant fields

    const filteredTasks = tasks.filter(task =>
        task.workflowDisplayName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        task.activityName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        task.eventName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        task.serialNumber.toLowerCase().includes(searchKeyword.toLowerCase())

    );

    // Sort tasks by taskStartDate
    filteredTasks.sort((a, b) => {
        const dateA = new Date(a.taskStartDate);
        const dateB = new Date(b.taskStartDate);
        return sortingOrder === "ASC" ? dateA - dateB : dateB - dateA;
    });

    console.log(filteredTasks)
    return filteredTasks;


}

function setNoResultsFound() {
    $("#dropdownContent").append(`
    <p id="NoTasksNotice"> ${currentLanguage == "AR" ? "لا توجد مهام" : "No Pending Tasks"} </p>
    `
    )
}

function setOrderAscending() {

    sortingOrder = "ASC"

    $("#sortAscending").css({
        "scale": "1.2",
        "opacity": "1"
    })

    $("#sortDescending").css({
        "scale": "1",
        "opacity": "0.4"
    })

    createNotificationIcon()
}

function setOrderDescending() {

    sortingOrder = "DESC"

    $("#sortDescending").css({
        "scale": "1.2",
        "opacity": "1"
    })

    $("#sortAscending").css({
        "scale": "1",
        "opacity": "0.4"
    })

    createNotificationIcon()

}
