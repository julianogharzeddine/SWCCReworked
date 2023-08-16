var baseURL;   // fetching the base URL

$(document).ready(function () {
    
    // Fetching the baseURL to use it in subsequent API Calls

    if(!baseURL) baseURL = window.location.protocol + '//' + window.location.host + '/';

    // Waiting to successfully fetch the categories to start rendering the Sidebar

    initializeSidebar()

    // Appending the listeners to the generated categories and subcategories , this section allows us to dynamically
    // select the K2 Dropdown values , thus maintaining rule interactions

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

function initializeSidebar(){

    fetchMainCategories()
        .then(function (data) {
            renderSidebar(data)
        })
        .catch(function (error) {
            console.error(error);
        });

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
                        <img src="data:image/svg+xml,${encodeURIComponent(category.CategoryIcon)}">
                  <p class='categoryName'>${category.CategoryNameAR}</p>
                </div>
                </div>`
                    )
                } else {
                    const subCategoriesHTML = data.map((subCategory) => {
                        return `<div class="subcategoryItem" data-subcat="${subCategory.ID}">
                                <p class='subcategoryName'>${subCategory.SubCategoryNameAR}</p>
                              </div>`;
                    }).join('');

                    $("#SidebarCategoryWrapper").append(
                        `<div class="categoryItemWrapper" ">
                        <div class="categoryItem" data-cat="${category.ID}">
                        <img src="data:image/svg+xml,${encodeURIComponent(category.CategoryIcon)}">
                        <p class='categoryName'>${category.CategoryNameAR}</p>
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




