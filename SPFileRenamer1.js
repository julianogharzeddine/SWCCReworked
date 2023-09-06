
$(document).ready(function () {
    // Function to update description divs
    function updateDescriptionDivs() {
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

    // Add click event listener to .blue button
    $('#Link.blue.ng-star-inserted').click(function () {
        // Call the function to update description divs
        setTimeout(updateDescriptionDivs, 2000)
    });
    setTimeout(function () {
        // Initial update
        updateDescriptionDivs();
    }, 3000)
});

