(function () {

    var baseURL;   // fetching the base URL

    $(document).ready(function () {

        // Fetching the baseURL to use it in subsequent API Calls

        baseURL = window.location.protocol + '//' + window.location.host + '/';

        // Waiting to successfully fetch the categories to start rendering the Sidebar

        initializeSidebar()

        // Appending the listeners to the generated categories and subcategories , this section allows us to dynamically
        // select the K2 Dropdown values , thus maintaining rule interactions

        $(document).on('click', '.categoryItemWrapper', function () {

            changeSelectedColor($(this))
            var selectionIndex = $(this).data("cat")
            var targetRadio = $('[name="CategoriesDropdown"]').find(`input[type='radio'][value='${selectionIndex}']`);
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

    function initializeSidebar() {

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
                url: `${baseURL}api/odatav4/v4/Categories_SMO?method=List&$filter=isActive eq 'true'`,
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

    function renderSidebar(data) {

        data.map((category) => {

            let categoryID = category.ID
            let isClickable = isTrue(category.IsClickable)
            let categoryName = langIsAr() ? category.CategoryNameAR : category.CategoryNameEN
            let categoryIcon = encodeURIComponent(category.CategoryIcon)

            if (!exists("#SidebarContainer")) $('body').append(`<div id='SidebarContainer'><div id="SidebarContentWrapper"></div></div>`)

            $("#SidebarContentWrapper").append(
                `<div class="categoryItemWrapper"  data-cat="${categoryID}" ${isClickable ? "data-hassubcategories=true" : "data-hasSubcategories=false"} ><div class="categoryItem" >
             <img src="data:image/svg+xml,${categoryIcon}">
             <p class='categoryName'>${categoryName}</p></div></div>
            `
            )

        })
    }

    function changeSelectedColor(current) {
        $(".categoryItemWrapper").removeClass("selectedCategory")
        current.addClass("selectedCategory")
    }

})()
