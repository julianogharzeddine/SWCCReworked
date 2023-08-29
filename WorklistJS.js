$(document).ready(function () {
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
