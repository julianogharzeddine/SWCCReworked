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
        $(document).on('click', '.taskDateSort', function () {

            if (sortingOrder !== $(this).data("order")) {
                sortingOrder = $(this).data("order")
                initializeFetchTasks()
            }

        })

        // When clicking on a task status option
        $(document).on('click', '.taskDateSort', function () {

            if (sortingOrder !== $(this).data("order")) {
                sortingOrder = $(this).data("order")
                initializeFetchTasks()
            }

        })


        // When clicking on a task status option
        $(document).on('input', '.worklistSearchKeyword', function () {
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
        worklistContainer.empty()

        let tasks = sortByDateAndKeyword(data)

        tasks.map((task) => {

            let taskFormURL = task.formURL ?? ""
            let taskActivityName = task.activityName ?? ""
            let taskSerialNo = task.serialNumber ?? ""
            let taskDate = formatDate(new Date(task.taskStartDate));
            let taskDueDate = formatDate(new Date(task.dueDate));
            let taskStatus = task.status;

            worklistContainer.append(`
            <div class="worklistItem" data-serial="${taskSerialNo}"> <div class="itemInfoWrapper taskSerialNo"> <p class="itemInfoHeading">${langIsAr() ? "الرقم التسلسلي" : "SERIAL NO."}</p><p class="itemInfoData"> <a href="${taskFormURL}" target="_blank">${taskSerialNo}</a> </p></div><div class="itemInfoWrapper taskTitle"> <p class="itemInfoHeading">${langIsAr() ? "الموضوع" : "TASK TITLE"}</p><p class="itemInfoData">${taskActivityName}</p></div><div class="itemInfoWrapper taskStartDate"> <p class="itemInfoHeading">${langIsAr() ? "التاريخ" : "ASSIGNED"}</p><p class="itemInfoData">${taskDate}</p></div><div class="itemInfoWrapper taskProgress"> <p class="itemInfoHeading">${langIsAr() ? "الحالة" : "STATUS"}</p>${renderTaskStatusComponent(taskStatus)}</p></div><div class="itemInfoWrapper taskDueDate"> <p class="itemInfoHeading">${langIsAr() ? "تاريخ الإنتهاء" : "DUE DATE"}</p><p class="itemInfoData">${taskDueDate}</p></div><div class="itemInfoWrapper taskActions"> <p class="itemInfoHeading">${langIsAr() ? "الإجراءات" : "ACTIONS"}</p><p class="itemInfoData"> <img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/release-icon.png" id="release-task" data-serial="${taskSerialNo}" class="action-task" alt="release"> <img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/sleep-icon.png" id="sleep-task" data-serial="${taskSerialNo}" class="action-task" alt="sleep"> <img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/redirect-icon.png" id="redirect-task" data-serial="${taskSerialNo}" class="action-task" alt="redirect"> <img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/share-icon.png" id="share-task" data-serial="${taskSerialNo}" class="action-task" alt="share"> </p></div></div>`)
        });

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
            $("#WorklistContainer").prepend(`
            <div id="WorklistFilterToolbar"><div id="SearchSection" class="toolbarSection"> <p class="filterTitle"> ${langIsAr() ? "البحث" : "Search"}</p><input type="text" id="worklistSearchKeyword"/></div><div id="DateFilterSection" class="toolbarSection"> <p class="filterTitle"> ${langIsAr() ? "التاريخ" : "Date Filter"}</p><img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/new-descending.svg" id="worklistDescending" data-order="DESC" class="taskDateSort"> <img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/new-ascending.svg" id="worklistAscending" data-order="ASC" class="taskDateSort"></div></div><div id="taskStatusOptionsOuterWrapper"><div id="taskStatusOptionsInnerWrapper"> <div id="AllTasks" class="taskStatusOption selectedOption" data-option-task="All"> <div class="wrapIcon"> <p class="optionTitle">${langIsAr() ? "الكل" : "All"}</p><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="64px" height="64px" viewBox="0 0 512.00 512.00" version="1.1" fill="#000000"> <g id="SVGRepo_bgCarrier" stroke-width="0"/> <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#8d97a1" stroke-width="62.464"> <g id="Page-1" stroke-width="20.48" fill="none" fill-rule="evenodd"> <g id="Combined-Shape" fill="#000000" transform="translate(70.530593, 46.125620)"> <path d="M185.469407,39.207713 L356.136074,39.207713 L356.136074,81.8743797 L185.469407,81.8743797 L185.469407,39.207713 Z M185.469407,188.541046 L356.136074,188.541046 L356.136074,231.207713 L185.469407,231.207713 L185.469407,188.541046 Z M185.469407,337.87438 L356.136074,337.87438 L356.136074,380.541046 L185.469407,380.541046 L185.469407,337.87438 Z M119.285384,-7.10542736e-15 L144.649352,19.5107443 L68.6167605,118.353113 L2.84217094e-14,58.3134476 L21.0721475,34.2309934 L64.0400737,71.8050464 L119.285384,-7.10542736e-15 Z M119.285384,149.333333 L144.649352,168.844078 L68.6167605,267.686446 L2.84217094e-14,207.646781 L21.0721475,183.564327 L64.0400737,221.13838 L119.285384,149.333333 Z M119.285384,298.666667 L144.649352,318.177411 L68.6167605,417.01978 L2.84217094e-14,356.980114 L21.0721475,332.89766 L64.0400737,370.471713 L119.285384,298.666667 Z"></path> </g> </g> </g> <g id="SVGRepo_iconCarrier"> <g id="Page-1" stroke-width="20.48" fill="none" fill-rule="evenodd"> <g id="Combined-Shape" fill="#8d97a1" transform="translate(70.530593, 46.125620)"> <path d="M185.469407,39.207713 L356.136074,39.207713 L356.136074,81.8743797 L185.469407,81.8743797 L185.469407,39.207713 Z M185.469407,188.541046 L356.136074,188.541046 L356.136074,231.207713 L185.469407,231.207713 L185.469407,188.541046 Z M185.469407,337.87438 L356.136074,337.87438 L356.136074,380.541046 L185.469407,380.541046 L185.469407,337.87438 Z M119.285384,-7.10542736e-15 L144.649352,19.5107443 L68.6167605,118.353113 L2.84217094e-14,58.3134476 L21.0721475,34.2309934 L64.0400737,71.8050464 L119.285384,-7.10542736e-15 Z M119.285384,149.333333 L144.649352,168.844078 L68.6167605,267.686446 L2.84217094e-14,207.646781 L21.0721475,183.564327 L64.0400737,221.13838 L119.285384,149.333333 Z M119.285384,298.666667 L144.649352,318.177411 L68.6167605,417.01978 L2.84217094e-14,356.980114 L21.0721475,332.89766 L64.0400737,370.471713 L119.285384,298.666667 Z"></path> </g> </g> </g> </svg> </div><div class="underline"></div></div><div id="Pending" class="taskStatusOption" data-option-task="Allocated"> <div class="wrapIcon"> <p class="optionTitle">${langIsAr() ? "بإنتظار المراجعة" : "Pending"}</p><svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" height="64px" width="64px" version="1.1" id="_x32_" viewBox="0 0 512 512" xml:space="preserve" fill="#8d97a1"> <g id="SVGRepo_bgCarrier" stroke-width="0"/> <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/> <g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill: #8d97a1;}</style> <g> <path class="st0" d="M156.212,109.589c0.83,18.192,8.696,35.558,22.026,48.053l41.742,39.147 c9.011,8.431,15.245,19.331,18.223,31.162c0,9.823,7.966,17.788,17.788,17.788c9.84,0,17.806-7.966,17.806-17.788 c2.974-11.831,9.213-22.73,18.218-31.162l41.747-39.147c13.33-12.495,21.197-29.861,22.026-48.053H156.212z"/> <path class="st0" d="M255.991,270.621c-6.449,0-11.67,5.221-11.67,11.671c0,6.449,5.221,11.67,11.67,11.67 c6.468,0,11.684-5.221,11.684-11.67C267.675,275.842,262.458,270.621,255.991,270.621z"/> <path class="st0" d="M255.991,333.744c-6.449,0-11.67,5.238-11.67,11.679c0,6.441,5.221,11.679,11.67,11.679 c6.468,0,11.684-5.238,11.684-11.679C267.675,338.983,262.458,333.744,255.991,333.744z"/> <path class="st0" d="M413.808,0H98.192v63.123h10.612c-0.026,0.619-0.085,1.22-0.085,1.83v45.955 c0,32.49,13.442,63.526,37.141,85.736l41.742,39.147c3.364,3.157,5.279,7.543,5.279,12.163v18.864c0,4.62-1.915,9.015-5.279,12.173 l-41.742,39.146c-23.699,22.21-37.141,53.238-37.141,85.737v45.003H98.192V512h315.616v-63.123h-10.526v-45.003 c0-32.499-13.442-63.527-37.142-85.737l-41.747-39.146c-3.359-3.158-5.274-7.553-5.274-12.173v-18.864 c0-4.62,1.915-9.006,5.262-12.163l41.76-39.147c23.7-22.21,37.142-53.246,37.142-85.736V64.953c0-0.61-0.058-1.211-0.086-1.83 h10.612V0z M292.818,247.954v18.864c0,11.885,4.921,23.242,13.585,31.351l41.748,39.146c18.388,17.24,28.83,41.344,28.83,66.559 v45.003h-40.442l-64.729-64.729c-8.737-8.728-22.883-8.728-31.633,0l-64.715,64.729h-40.443v-45.003 c0-25.215,10.438-49.319,28.83-66.55l41.747-39.155c8.666-8.109,13.585-19.466,13.585-31.351v-18.864 c0-11.886-4.92-23.233-13.585-31.36l-41.747-39.146c-18.393-17.232-28.83-41.326-28.83-66.54V64.953 c0-0.628,0.112-1.211,0.184-1.83h241.594c0.072,0.619,0.184,1.202,0.184,1.83v45.955c0,25.215-10.441,49.308-28.83,66.54 l-41.748,39.146C297.739,224.721,292.818,236.068,292.818,247.954z"/> </g> </g> </svg> </div><div class="underline"></div></div><div id="Completed" class="taskStatusOption" data-option-task="Completed"> <div class="wrapIcon"> <p class="optionTitle">${langIsAr() ? "المكتملة" : "Completed"}</p><svg fill="#8d97a1" height="64px" width="64px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" enable-background="new 0 0 512 512" xml:space="preserve"> <g id="SVGRepo_bgCarrier" stroke-width="0"></g> <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g> <g id="SVGRepo_iconCarrier"> <polygon points="437.3,30 202.7,339.3 64,200.7 0,264.7 213.3,478 512,94 "></polygon> </g> </svg> </div><div class="underline"></div></div><div id="Overdue" class="taskStatusOption" data-option-task="Overdue"> <div class="wrapIcon"> <p class="optionTitle">${langIsAr() ? "المتأخرة" : "Overdue"}</p><svg xmlns="http://www.w3.org/2000/svg" shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 502 511.82" height="64" width="64" fill="#8d97a1"> <path fill-rule="nonzero" d="M280.75 471.21c14.34-1.9 25.67 12.12 20.81 25.75-2.54 6.91-8.44 11.76-15.76 12.73a260.727 260.727 0 0 1-50.81 1.54c-62.52-4.21-118.77-31.3-160.44-72.97C28.11 392.82 0 330.04 0 260.71 0 191.37 28.11 128.6 73.55 83.16S181.76 9.61 251.1 9.61c24.04 0 47.47 3.46 69.8 9.91a249.124 249.124 0 0 1 52.61 21.97l-4.95-12.96c-4.13-10.86 1.32-23.01 12.17-27.15 10.86-4.13 23.01 1.32 27.15 12.18L428.8 68.3a21.39 21.39 0 0 1 1.36 6.5c1.64 10.2-4.47 20.31-14.63 23.39l-56.03 17.14c-11.09 3.36-22.8-2.9-26.16-13.98-3.36-11.08 2.9-22.8 13.98-26.16l4.61-1.41a210.71 210.71 0 0 0-41.8-17.12c-18.57-5.36-38.37-8.24-59.03-8.24-58.62 0-111.7 23.76-150.11 62.18-38.42 38.41-62.18 91.48-62.18 150.11 0 58.62 23.76 111.69 62.18 150.11 34.81 34.81 81.66 57.59 133.77 61.55 14.9 1.13 30.23.76 44.99-1.16zm-67.09-312.63c0-10.71 8.69-19.4 19.41-19.4 10.71 0 19.4 8.69 19.4 19.4V276.7l80.85 35.54c9.8 4.31 14.24 15.75 9.93 25.55-4.31 9.79-15.75 14.24-25.55 9.93l-91.46-40.2c-7.35-2.77-12.58-9.86-12.58-18.17V158.58zm134.7 291.89c-15.62 7.99-13.54 30.9 3.29 35.93 4.87 1.38 9.72.96 14.26-1.31 12.52-6.29 24.54-13.7 35.81-22.02 5.5-4.1 8.36-10.56 7.77-17.39-1.5-15.09-18.68-22.74-30.89-13.78a208.144 208.144 0 0 1-30.24 18.57zm79.16-69.55c-8.84 13.18 1.09 30.9 16.97 30.2 6.21-.33 11.77-3.37 15.25-8.57 7.86-11.66 14.65-23.87 20.47-36.67 5.61-12.64-3.13-26.8-16.96-27.39-7.93-.26-15.11 4.17-18.41 11.4-4.93 10.85-10.66 21.15-17.32 31.03zm35.66-99.52c-.7 7.62 3 14.76 9.59 18.63 12.36 7.02 27.6-.84 29.05-14.97 1.33-14.02 1.54-27.9.58-41.95-.48-6.75-4.38-12.7-10.38-15.85-13.46-6.98-29.41 3.46-28.34 18.57.82 11.92.63 23.67-.5 35.57zM446.1 177.02c4.35 10.03 16.02 14.54 25.95 9.96 9.57-4.4 13.86-15.61 9.71-25.29-5.5-12.89-12.12-25.28-19.69-37.08-9.51-14.62-31.89-10.36-35.35 6.75-.95 5.03-.05 9.94 2.72 14.27 6.42 10.02 12 20.44 16.66 31.39z"/> </svg> </div><div class="underline"></div></div></div></div>
    `)
        }
    }

})()







