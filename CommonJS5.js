var baseURL;   // fetching the base URL



$(document).ready(function () {
    
    // Fetching the baseURL to use it in subsequent API Calls

    baseURL = window.location.protocol + '//' + window.location.host + '/';

    
    // Waiting to successfully fetch the categories to start rendering the Sidebar

    fetchMainCategories()
        .then(function (data) {
            renderSidebar(data)
        })
        .catch(function (error) {
            console.error(error);
        });

   // Creating Notification Icon

    createNotificationIcon()

    // Appending the listeners to the generated categories and subcategories

    $(document).on('click', '.categoryItem', function () {
        var selectionIndex = $(this).data("cat")
        console.log(selectionIndex)
        var targetRadio = $('[name="CategoriesDropdown"]').find(`input[type='radio'][value='${selectionIndex}']`);
        console.log(targetRadio.length)
        targetRadio.trigger('click')
    })

    $(document).on('click', '.subcategoryItem', function () {
        var selectionIndex = $(this).data("subcat")
        var targetRadio = $('[name="SubcategoriesDropdown"]').find(`input[type='radio'][value='${selectionIndex}']`);
        targetRadio.trigger('click')
    })

    $(document).on('click', '#bellicon', function () {
        $('#dropdownContent').toggle()
    });

 

})


function goTo(href) {
    if (href) {
        window.open(href, "_self")
    }
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
      <a href = "${task.formURL}" target = "_self" >
        <div class="date-icon ">${firstThreeDigits}</div>
        <div class="task-details">
          <h4>${task.activityName}</h4>
          <p>${task.serialNumber}</p>
        </div>
      </a>
`)
    })

}


function renderSidebar(data) {

    $("[name='Sidebar']").append(`<div id="SidebarCategoryWrapper"></div>`)
    data.map((category) => {

        const categoryID = category.ID

        fetchSubCategories(categoryID)
            .then(function (data) {

                console.log(data);

                if (data === []) {
                    $("#SidebarCategoryWrapper").append(
                        `<div class="categoryItemWrapper" >
                        <div class="categoryItem" data-cat="${category.ID}">
                  <img src='${category.CategoryImageURL}'>
                  <p class='categoryName'>${category.CategoryNameAr}</p>
                </div>
                </div>`
                    )
                } else {
                    const subCategoriesHTML = data.map((subCategory) => {
                        return `<div class="subcategoryItem" data-subcat="${subCategory.ID}">
                                <p class='subcategoryName'>${subCategory.SubCategoryNameAr}</p>
                              </div>`;
                    }).join('');

                    $("#SidebarCategoryWrapper").append(
                        `<div class="categoryItemWrapper" ">
                        <div class="categoryItem" data-cat="${category.ID}">
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
            url: `${baseURL}api/odatav4/v4/Categories_SMO`,
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
            url: `${baseURL}api/odatav4/v4/SubCategories_SMO`,
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

                console.log('The filtered subcategory', filtered)
                resolve(filtered);
            },
            error: function () {
                reject('Failed to Load Subcategories!');
            }
        });
    });
}
