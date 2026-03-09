window.addEventListener("load", () => {
    let gridSize = ""

    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        // Read layout on start
        chrome.tabs.sendMessage(tabs[0].id, {action: 'readBoard'}, (response) => {
            gridSize = response.size;
            document.getElementById("grid").innerHTML = gridSize + " x " + gridSize + "<br>Grid detected"
        });
        // Solve button
        document.getElementById("solve").addEventListener("click", function(event) {
            chrome.tabs.sendMessage(tabs[0].id, {action: 'solve'});
        });
    });
});