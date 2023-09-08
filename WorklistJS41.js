(function () {
    var baseURL;
    var sortingOrder = "";
    var searchKeyword = ""

    $(document).ready(function () {

        baseURL = window.location.protocol + '//' + window.location.host + '/';

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

        // When clicking on a task status option
        $(document).on('click', '#WorklistContainer .taskDateSort', function () {

            let dataOrder = $(this).data("order");

            if (sortingOrder !== dataOrder) {
                sortingOrder = dataOrder
                selectDateFilter($(this))
                initializeFetchTasks()
            }

        })


        // When clicking on a task status option
        $(document).on('input', '#worklistSearchKeyword', function () {
            searchKeyword = $(this).val().trim()
            initializeFetchTasks()
        })

        // This initializes the default state of the worklist without the actual tasks
        waitForWorklistContainerWrapperRender()

        initializeFetchTasks()

    })

    function initializeFetchTasks() {
        fetchTasks()
            .then((data) => waitForWorklistItemsWrapperRender(data))
            .catch((error) => console.error(error))
    }

    function fetchTasks() {

        showWorklistLoadingOverlay()

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

    }


    function sortByDateAndKeyword(tasks) {

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

        return filteredTasks;


    }

    function waitForWorklistItemsWrapperRender(data = null) {

        if (exists('#worklist-items-wrapper')) {
            renderWorklist(data)
        } else {
            setTimeout(() => waitForWorklistItemsWrapperRender(data), 500);
        }
    }

    function waitForWorklistContainerWrapperRender() {
        if (exists('#WorklistContainer')) {
            renderWorklistToolbars()
        } else {
            setTimeout(waitForWorklistContainerWrapperRender, 500);
        }
    }

    function renderWorklist(data) {

        let worklistContainer = $("#worklist-items-wrapper")

        // Clearing the worklist content if it already has results

        worklistContainer.html(``)
        let tasks = sortByDateAndKeyword(data)

        tasks.map((task) => {

            let taskFormURL = task.formURL ?? "";
            let taskActivityName = task.activityName;
            let taskSerialNo = task.serialNumber;
            let taskDate = formatDate(new Date(task.taskStartDate));
            let taskDueDate = formatDate(new Date(task.dueDate));
            let taskStatus = task.status;

            worklistContainer.append(`
            <div class="worklistItem" data-serial="${taskSerialNo}"><div class="itemInfoWrapper taskSerialNo"><p class="itemInfoHeading">${langIsAr() ? "الرقم التسلسلي" : "SERIAL NO."}</p><p class="itemInfoData"><a href="${taskFormURL}" dir="${langIsAr() ? 'ltr' : ''}" target="_blank">${taskSerialNo}</a></p></div><div class="itemInfoWrapper taskTitle"><p class="itemInfoHeading">${langIsAr() ? "الموضوع" : "TASK TITLE"}</p><p class="itemInfoData">${taskActivityName}</p></div><div class="itemInfoWrapper taskStartDate"><p class="itemInfoHeading">${langIsAr() ? "التاريخ" : "ASSIGNED"}</p><p class="itemInfoData">${taskDate}</p></div><div class="itemInfoWrapper taskProgress"><p class="itemInfoHeading">${langIsAr() ? "الحالة" : "STATUS"}</p>${renderTaskStatusComponent(taskStatus)}</div><div class="itemInfoWrapper taskDueDate"><p class="itemInfoHeading">${langIsAr() ? "تاريخ الإنتهاء" : "DUE DATE"}</p><p class="itemInfoData">${taskDueDate}</p></div><div class="itemInfoWrapper taskActions"><p class="itemInfoHeading">${langIsAr() ? "الإجراءات" : "ACTIONS"}</p><p class="itemInfoData"><img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/release-icon.png" id="release-task" data-serial="${taskSerialNo}" class="action-task" alt="release"> <img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/sleep-icon.png" id="sleep-task" data-serial="${taskSerialNo}" class="action-task" alt="sleep"> <img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/redirect-icon.png" id="redirect-task" data-serial="${taskSerialNo}" class="action-task" alt="redirect"> <img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/share-icon.png" id="share-task" data-serial="${taskSerialNo}" class="action-task" alt="share"></p></div></div>`)
        });

        hideWorklistLoadingOverlay()

    }

    function renderTaskStatusComponent(status) {
        let statusComponent;

        switch (status) {
            case "Available":
                statusComponent = `<div class='itemInfoData cardStatusComplete'> ${langIsAr() ? "متاحة" : "Available"} </div>`;
                break;
            case "Allocated":
                statusComponent = `<div class='itemInfoData cardStatusComplete'> ${langIsAr() ? "معينة" : "Allocated"} </div>`;
                break;
            case "Open":
                statusComponent = `<div class='itemInfoData cardStatusPending'> ${langIsAr() ? "قيد الانتظار" : "Pending"} </div>`;
                break;
            case "Completed":
                statusComponent = `<div class='itemInfoData cardStatusNew'> ${langIsAr() ? "مكتملة" : "Completed"} </div>`;
                break;
        }

        return statusComponent;
    }

    function formatDate(date) {
        const dateObject = new Date(date);
        const year = dateObject.getFullYear();
        const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
        const day = dateObject.getDate().toString().padStart(2, "0");


        const formattedDate = year == "9999" ? (langIsAr() ? "لا تاريخ استحقاق" : "No Due Date") : `${year}/${month}/${day}`;

        return formattedDate;
    }

    function renderWorklistToolbars() {

        if (!exists("#WorklistFilterToolbar")) {
            $("#WorklistContainer").prepend(`<div id="WorklistFilterToolbar"><div id="SearchSection" class="toolbarSection"><p class="filterTitle">${langIsAr() ? "البحث" : "Search"}</p><input type="text" id="worklistSearchKeyword"></div><div id="DateFilterSection" class="toolbarSection"><p class="filterTitle">${langIsAr() ? "التاريخ" : "Date Filter"}</p><img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/new-descending.svg" id="worklistDescending" data-order="DESC" class="taskDateSort selected-date-filter"> <img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/new-ascending.svg" id="worklistAscending" data-order="ASC" class="taskDateSort"></div></div>`)
        }
    }

    function showWorklistLoadingOverlay() {
        $('.worklistLoadingOverlay').css("visibility", "visible")
        $('#worklist-items-wrapper').css("pointer-events", "none")
    }

    function hideWorklistLoadingOverlay() {
        $('.worklistLoadingOverlay').css("visibility", "hidden")
        $('#worklist-items-wrapper').css("pointer-events", "auto")
    }

    function selectDateFilter(currentlyClicked) {
        $("#WorklistContainer").find(".taskDateSort").removeClass("selected-date-filter")
        currentlyClicked.addClass("selected-date-filter")
    }

})()







