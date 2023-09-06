

$(document).ready(function () {
    let currentURL = window.location.href;
    console.log(currentURL)
    if (currentURL.includes("Designer") && currentURL.includes("styleprofile")) {
        setInterval(updateDescriptionDivs, 1000)
    }

});


// Function to update description divs
function updateDescriptionDivs() {

    console.log("hello")
    // Loop over all divs with class "description"
    $('.description').each(function () {
        // Get the content of the div
        const content = $(this).text();

        // Extract the file name from the content
        const fileName = content.match(/[^/\\&?]+$/);

        // Update the text of the div with the filename
        $(this).text(fileName);
    });
}
