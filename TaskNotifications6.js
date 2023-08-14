var baseURL;   // fetching the base URL

$(document).ready(function () {

    // Fetching the baseURL to use it in subsequent API Calls
    if (!baseURL) baseURL = window.location.protocol + '//' + window.location.host + '/';

    // Creating the notification Icon
    createNotificationIcon()

    // On click listener for the notification icon
    $(document).on('click', '#bellicon', function () {
        $('#dropdownContent').toggle()
    });

})

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
            </div>
        </a>
    `);
});


    translateNotifications()

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
