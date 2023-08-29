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

    waitForWorklistWrapperRender()
})

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
