

var baseURL;

$(document).ready(function () {

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

    initializeFetchTasks()
})

function initializeFetchTasks() {
    fetchTasks()
        .then((data) => waitForWorklistWrapperRender(data))
        .catch((error) => console.error(error))
}

function fetchTasks() {
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

function waitForWorklistWrapperRender(data) {
    if ($('#worklist-items-wrapper').length > 0) {
        renderWorklist(data)
    } else {
        setTimeout(waitForWorklistWrapperRender, 500);
    }
}

function renderWorklist(data) {

    let worklistContainer = $("#worklist-items-wrapper")
    // Clearing the worklist content if it already has results
    worklistContainer.empty()

    data.map((task) => {

        let taskFormURL = task.formURL ?? ""
        let taskActivityName = task.activityName ?? ""
        let taskSerialNo = task.serialNumber ?? ""
        let taskDate = formatDate(new Date(task.taskStartDate));
        let taskDueDate = formatDate(new Date(task.dueDate));

        worklistContainer.append(`
        <div class="worklistItem" data-serial="${taskSerialNo}"><div class="itemInfoWrapper"><p class="itemInfoHeading">SERIAL NO.</p><p class="itemInfoData"><a href="${taskFormURL}" target="_blank">${taskSerialNo}</a></p></div><div class="itemInfoWrapper"><p class="itemInfoHeading">TASK TITLE</p><p class="itemInfoData">${taskActivityName}</p></div><div class="itemInfoWrapper"><p class="itemInfoHeading">ASSIGNED</p><p class="itemInfoData">${taskDate}</p></div><div class="itemInfoWrapper"><p class="itemInfoHeading">STATUS</p><p class="itemInfoData">In Progress</p></div><div class="itemInfoWrapper"><p class="itemInfoHeading">DUE DATE</p><p class="itemInfoData">${taskDueDate}</p></div><div class="itemInfoWrapper taskActions"><p class="itemInfoHeading">ACTIONS</p><p class="itemInfoData">In Progress</p></div></div>
        `)
    })

}

function formatDate(date) {
    const dateObject = new Date(date);
    const year = dateObject.getFullYear();
    const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
    const day = dateObject.getDate().toString().padStart(2, "0");

    const formattedDate = `${year}/${month}/${day}`;
    return formattedDate;
}

