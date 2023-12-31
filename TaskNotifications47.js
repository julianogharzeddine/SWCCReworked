
(function () {

    var baseURL;   // fetching the base URL
    var sortingOrder = ""  // the default sorting order is not specified
    var searchKeyword = ""

    $(document).ready(function () {

        // Fetching the baseURL to use it in subsequent API Calls
        baseURL = window.location.protocol + '//' + window.location.host + '/';

        // Creating the notification Icon
        createNotificationIcon()

        // On click listener for the notification icon
        $(document).on('click', '#bellicon', function () {
            $('#taskDDMainWrapper').toggle()
        });

        // Click behaviors for the sorting icons 
        $(document).on('click', '.taskDD .taskDateSort', function () {

            let dataOrder = $(this).data("order");

            if (sortingOrder !== dataOrder) {
                sortingOrder = dataOrder
                selectDateFilter($(this))
                createNotificationIcon()
            }

        });

        // Click behaviors for the sorting icons 
        $(document).on('input', '#taskSearchKeyword', function () {
            searchKeyword = $(this).val()
            createNotificationIcon()
        });

    })

    // Dynamically rendering the tasks
    function createNotificationIcon() {

        // If the taskDD already exists we don't recreate its structure again , we would only fill the dropdownContent
        createTaskDDStructure()

        // show Loading overlay
        showLoadingOverlay()

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

        // Task Count
        let taskCount = tasks.length ?? 0


        // Setting the task counter
        setTaskCounter(taskCount)

        // If no tasks were found , display the notice saying so
        if (taskCount == 0) {
            setNoResultsFound()
            hideLoadingOverlay()
            return
        }

        // Clearing the content of the tasks in case it already contains data
        $('#dropdownContent').empty()

        // Fetching the filtered tasks based on the sorting order and the search keyword
        const filteredTasks = sortByDateAndKeyword(tasks)

        // If no tasks fit the criteria , we display the notice to the user
        if (filteredTasks.length == 0) {
            setNoResultsFound()
            hideLoadingOverlay()
            return
        }

        // Looping over the filtered tasks and rendering them
        filteredTasks.map((task) => {
            let taskFormURL = task.formURL ?? ""
            let taskActivityName = task.activityName ?? ""
            let taskSerialNo = task.serialNumber ?? ""
            let taskDate = new Date(task.taskStartDate ?? Date.now());
            let dayName = getDayName(taskDate, { weekday: 'long' });

            $('#dropdownContent').append(`
        <a href="${taskFormURL}" target="_blank">
            <div class="date-icon">${dayName}</div>
            <div class="task-details">
                <h4>${taskActivityName}</h4>
                <p>${taskSerialNo}</p>
                <p class='taskDate'>${formatDate(taskDate)}</p></div></a>
    `);
        });

        // Marking the loading as complete
        hideLoadingOverlay()

    }

    // Creates the structure for the tasks dropdown
    function createTaskDDStructure() {


        if (exists('.taskDD')) {
            return
        }

        $('body').append(`
    <div class="taskDD">
    <div id="iconWrapper">
        <div id="notificationCounter">
            <p id="redCircle"></p>
        </div>
        <img id="bellicon" src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/BellIcon.png" alt="Bell Icon">
    </div>
    <div id="taskDDMainWrapper">
        <div id="taskToolbarWrapper">
            <div id="taskSearchWrapper" class="filterOptionWrapper">
                <span>${langIsAr() ? "البحث" : "Search"}</span>
                <input type="text" id="taskSearchKeyword">
            </div>
            <div id="taskDateWrapper" class="filterOptionWrapper">
                <span>${langIsAr() ? "التاريخ" : "Date"}</span>
                <div class="sortingIconsWrapper">
                <img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/sort-descending.png" data-order="DESC" id="sortNotificationTaskDescending" class="taskDateSort selected-date-filter" alt="DESC">
                </div>
                <div class="sortingIconsWrapper">
                    <img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/sort-ascending.png" data-order="ASC" id="sortNotificationTaskAscending" class="taskDateSort" alt="ASC">
                </div>
            </div>
        </div>
        <div class="taskOverlayWrapper">
        <div class="notifTasksLoadingOverlay"><img src="https://cdn.jsdelivr.net/gh/julianogharzeddine/SWCCIcons@main/AnimatedLoading.svg" class="AnimatedLoading" alt="Loading Animation"></div>
        <div id="dropdownContent"></div>
        </div>
    </div>
</div>
`)
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

    // Displaying "No tasks found" message
    function setNoResultsFound() {
        $("#dropdownContent").append(`
    <p id="NoTasksNotice"> ${langIsAr() ? "لا توجد مهام" : "No Pending Tasks"} </p>
    `)
    }


    function formatDate(date) {
        const dateObject = new Date(date);
        const year = dateObject.getFullYear();
        const month = (dateObject.getMonth() + 1).toString().padStart(2, "0");
        const day = dateObject.getDate().toString().padStart(2, "0");

        const formattedDate = `${year}/${month}/${day}`;
        return formattedDate;
    }

    function getDayName(date, options) {

        let dayName;

        if (langIsAr()) {
            dayName = new Intl.DateTimeFormat('ar-EG', options).format(date); // Use the appropriate locale for Arabic
        } else {
            dayName = new Intl.DateTimeFormat('en-US', options).format(date);
            dayName = dayName.slice(0, 3);
        }
        return dayName;
    }

    function showLoadingOverlay() {
        $('.notifTasksLoadingOverlay').css("visibility", "visible")
        $('#dropdownContent').css("pointer-events", "none")
    }

    function hideLoadingOverlay() {
        $('.notifTasksLoadingOverlay').css("visibility", "hidden")
        $('#dropdownContent').css("pointer-events", "auto")
    }

    function setTaskCounter(count) {
        $("#redCircle").text(count)
    }

    function selectDateFilter(currentlyClicked) {
        $(".taskDD").find(".taskDateSort").removeClass("selected-date-filter")
        currentlyClicked.addClass("selected-date-filter")
    }

})()

