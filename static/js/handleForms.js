/**
 * Prevent the normal submission of the generate form, and instead force it to make an ajax request,
 * then draw the generated map onto the screen.
 */
generateForm.submit(function(e) {
    // Prevent normal submission of the page
    e.preventDefault();

    // Get the form data
    let form = $(this);
    let url = form.attr('action');

    // Make ajax call to generate
    $.ajax({
        type: "POST",
        url: url,
        data: form.serialize(),
        success: function (response) {
            // Render the tiles to the screen
            renderTiles(response)
        },
        error: function (response) {
            console.log("Error...")
            console.log(response)
        }
    });
});

/**
 * Copies a given element to the clipboard of the user to share with. First, generate a temporary input
 * and add it to the body of the page. Then, copy the text to that element, and then to the user's
 * clipboard. Finally, remove the temporary element.
 * @param element An element to get the text of to put on the user's clipboard.
 */
function copyToClipboard(element) {
    let $temp = $("<input>");
    $("body").append($temp);
    $temp.val($(element).text()).select();
    document.execCommand("copy");
    $temp.remove();
}

/**
 * Get the possible board styles the given player count can have
 */
playerCount.change(function () {
    // Clear the current select
    boardStyle.html("")

    // Add in new options from boardStyles
    for (let styleIndex in BOARD_STYLES[playerCount.val()]) {
        let style = BOARD_STYLES[playerCount.val()][styleIndex]
        boardStyle.append(
            // Capitalize the board style
            "<option value=\"" + style + "\">" + style.charAt(0).toUpperCase() + style.slice(1) + "</option>"
        )
    }
})

/**
 * Prevent the normal submission of the tile form, and instead attempt to parse it and draw the map to
 * the screen.
 */
tileForm.submit(function(e) {
    // Prevent normal submission of the page
    e.preventDefault();

    // Render the tiles from the tileStringInput
    renderTiles(validateTiles(tileStringInput.val()))
});