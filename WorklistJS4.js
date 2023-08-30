

var baseURL;

$(document).ready(async function () {

    // When clicking on a task status option
    $(document).on('click', '.taskStatusOption', function () {

        // Clearing other underlined options
        $(".underline").css("width", "0")

        // Adding the underline to the current option
        $(this).find('.underline').css("width", "100%")

        // Unselecting the previously selected option
        $(".taskStatusOption").removeClass("selectedOption")

        // Reselecting the CURRENT option
        $(this).addClass("selectedOption")
    })


    const tasks = await fetchTasks()
    console.log(tasks)

    waitForWorklistWrapperRender()
})

async function fetchTasks() {
    try {
        return new Promise((resolve, reject) => {
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
                    let taskArray = json_data.tasks;
                    resolve(taskArray); // Resolve the promise with the taskArray
                },
                error: function () {
                    reject(new Error('Failed to Load Tasks!')); // Reject the promise if there is an error
                }
            });
        });
    } catch (error) {
        alert(error.message);
        return null; // Return null or another error indicator
    }
}

function waitForWorklistWrapperRender() {
    if ($('#worklist-items-wrapper').length > 0) {
        renderWorklist()
    } else {
        setTimeout(waitForWorklistWrapperRender, 500);
    }
}

function renderWorklist() {
    $("#worklist-items-wrapper").append("<p> Hello </p>")
}


