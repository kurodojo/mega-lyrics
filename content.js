chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getSongInfo") {
        let title = document.querySelector(".track-info__name a")?.innerText;
        let artist = document.querySelector(".track-info__artists a")?.innerText;

        if (title && artist) {
            sendResponse({ title, artist });
        } else {
            sendResponse({ error: "No song playing or could not fetch data." });
        }
    }
});
