document.getElementById("findLyrics").addEventListener("click", () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript(
            {
                target: { tabId: tabs[0].id },
                function: fetchSongInfo
            },
            (results) => {
                if (!results || !results[0].result) {
                    alert("Could not fetch song info. Make sure a song is playing!");
                    return;
                }

                let { title, artist } = results[0].result;
                console.log("Extracted Song Info:", title, "by", artist);

                if (!title || !artist) {
                    alert("Couldn't find song information. Try refreshing Spotify.");
                    return;
                }

                // Format title
                let formattedTitle = formatForGenius(title);

                // Format artist names, remove duplicates
                let formattedArtist = formatForGenius([...new Set(artist)], true); 

                let geniusUrl = `https://genius.com/${formattedArtist}-${formattedTitle}-lyrics`;
                console.log("Opening Genius Lyrics:", geniusUrl);
                window.open(geniusUrl, "_blank");
            }
        );
    });
});

function fetchSongInfo() {
    let titleElement = document.querySelector('[data-testid="context-item-link"]');
    let artistElements = document.querySelectorAll('[data-testid="context-item-info-artist"]'); // Get all artist links

    console.log("Title Element:", titleElement ? titleElement.innerText : "Not Found");

    let artists = Array.from(artistElements).map(a => a.innerText); // Extract artist names

    console.log("Artist Elements:", artists.length > 0 ? artists : "Not Found");

    if (titleElement && artists.length > 0) {
        return { title: titleElement.innerText, artist: artists };
    }
    return null;
}

// Function to format song titles and artist names for Genius URLs
function formatForGenius(text, isArtist = false) {
    if (isArtist) {
        if (Array.isArray(text)) {
            // ✅ Ensure unique artist names by removing duplicates
            text = [...new Set(text)].join("-and-");
        }

        // Convert "&" into "and"
        text = text.replace(/\s*&\s*/g, "-and-");

        // Remove non-Latin characters (optional, to avoid issues with mixed names)
        text = text.replace(/[^\x00-\x7F]+/g, "");
    } else {
        // ✅ Remove common extra tags in song titles
        text = text.replace(/-\s?(remastered\s?\d{4})/gi, "")  // Remove "Remastered YYYY"
                   .replace(/-\s?(live\s?\d{4})/gi, "")        // Remove "Live YYYY"
                   .replace(/-\s?(deluxe edition)/gi, "")      // Remove "Deluxe Edition"
                   .replace(/-\s?(remix)/gi, "")               // Remove "Remix"
                   .replace(/-\s?(explicit)/gi, "")            // Remove "Explicit"
                   .replace(/-\s?(single version)/gi, "");     // Remove "Single Version"
    }
    
    return text
        .toLowerCase()                           // Convert to lowercase
        .replace(/\(feat[^\)]*\)/gi, "")         // Remove (feat. Artist)
        .replace(/\(.*?\)/g, "")                 // Remove any remaining parentheses
        .replace(/\[.*?\]/g, "")                 // Remove brackets
        .replace(/[^a-z0-9\s-]/g, "")            // Remove special characters except spaces & hyphens
        .trim()                                  // Trim extra spaces
        .replace(/\s+/g, "-");                   // Replace spaces with hyphens
}