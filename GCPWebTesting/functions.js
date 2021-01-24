//Global Variables for later
let inputValues
let seeds
let trackURIs
let playlistID

function generatePlaylist() {
    getInputValues()
}

function getInputValues() {
    let seedDivs = document.getElementsByClassName("seedDiv")
    inputValues = Array(seedDivs.length)
    for (let i = 0; i < seedDivs.length; i++) {
        let type = seedDivs[i].getElementsByClassName("seedSelect")[0].value
        let value = seedDivs[i].getElementsByClassName("seedInput")[0].value
        inputValues[i] = {
            type: type,
            value: value
        }
    }
    for (let i = 0; i < inputValues.length; i++) {
        if (inputValues[i].value == "") {
            inputValues.splice(i)
        }
    }
    if (inputValues.length > 0) {
        getSpotifyId(0, getSpotifyId)
    } else {
        alert("Please write at least 1 seed value")
    }
}

function getSpotifyId(target, callback) {
    if (inputValues[target].type != "Genre") {
        let searchRequest = new XMLHttpRequest()
        let query = "?q=" + inputValues[target].value.replaceAll(" ", "%20")
        let type = "&type=" + inputValues[target].type.toLowerCase()
        let limit = "&limit=1"
        let market = "&market=" + user_country
        searchRequest.open("GET", "https://api.spotify.com/v1/search" + query + type + limit + market)
        searchRequest.setRequestHeader("Authorization", "Bearer " + access_token)
        searchRequest.send()
        searchRequest.onreadystatechange = function () {
            if (searchRequest.readyState == XMLHttpRequest.DONE && searchRequest.status == 200 && searchRequest.responseText != "") {
                let response = JSON.parse(searchRequest.responseText)
                inputValues[target].value = response[inputValues[target].type.toLowerCase() + "s"].items[0].id //Index of response is either Tracks or Artists depending on the type of the inputvalue
                if (target + 1 < inputValues.length && inputValues[target + 1].value != 0) {
                    callback(target + 1, getSpotifyId)
                } else {
                    getTracks()
                }
            } else if (searchRequest.readyState == XMLHttpRequest.DONE && searchRequest.status == 401) {
                if (confirm("Token has expired or is invalid, do you want to get a new one?")) {
                    window.open("https://accounts.spotify.com/authorize?client_id=b12e7cbb42944fbbbfd1756a0ad6e3fc&response_type=token&redirect_uri=" + URL.replaceAll("/", "%2F") +
                        "&scope=user-read-private%20playlist-modify-public", "_self")
                }
            }
        }
    } else {
        if (target + 1 < inputValues.length && inputValues[target + 1].value != 0) {
            callback(target + 1, getSpotifyId)
        } else {
            getTracks()
        }
    }
}

function getTracks() {
    let noOfTracks = document.getElementById("trackSlider").value
    trackURIs = Array(noOfTracks)
    let trackRequest = new XMLHttpRequest()
    let limit = "?limit=" + noOfTracks
    let market = "&market=" + user_country
    let seeds = getSeeds()
    let seed_artists = seeds[0].length > 0 ? "&seed_artists=" + seeds[0] : ""
    let seed_tracks = seeds[1].length > 0 ? "&seed_tracks=" + seeds[1] : ""
    let seed_genres = seeds[2].length > 0 ? "&seed_genres=" + seeds[2] : ""
    trackRequest.open("GET", "https://api.spotify.com/v1/recommendations" + limit + market + seed_artists + seed_tracks + seed_genres)
    trackRequest.setRequestHeader("Authorization", "Bearer " + access_token)
    trackRequest.send()
    trackRequest.onreadystatechange = function () {
        if (trackRequest.readyState == XMLHttpRequest.DONE && trackRequest.status == 200 && trackRequest.responseText != "") {
            let trackResponse = JSON.parse(trackRequest.responseText).tracks
            for (let i = 0; i < trackResponse.length; i++) {
                trackURIs[i] = trackResponse[i].uri
            }
            createPlaylist()
        }
    }
}

function getSeeds() {
    returnValues = Array(3)

    let artistString = ""
    let trackString = ""
    let genreString = ""

    for (let i = 0; i < inputValues.length; i++) {
        if (inputValues[i].type == "Artist") {
            artistString += artistString.length > 0 ? "," + inputValues[i].value : inputValues[i].value
        } else if (inputValues[i].type == "Track") {
            trackString += trackString.length > 0 ? "," + inputValues[i].value : inputValues[i].value
        } else {
            genreString += genreString.length > 0 ? "," + inputValues[i].value.toLowerCase().replaceAll(" ", "-") : inputValues[i].value.toLowerCase().replaceAll(" ", "-")
        }
    }
    return [artistString, trackString, genreString]
}

function createPlaylist() {
    let JSONbody = JSON.stringify(buildPlaylistJSON())
    let playlistRequest = new XMLHttpRequest()
    playlistRequest.open("POST", "https://api.spotify.com/v1/users/" + user_id + "/playlists")
    playlistRequest.setRequestHeader("Authorization", "Bearer " + access_token)
    playlistRequest.setRequestHeader("content-type", "application/json")
    playlistRequest.send(JSONbody)
    playlistRequest.onreadystatechange = function () {
        console.log("Change")
        if (playlistRequest.readyState == XMLHttpRequest.DONE && playlistRequest.status == 201 && playlistRequest.responseText != "") {
            console.log("Passed If")
            console.log(playlistRequest.responseText)
            playlistResponse = JSON.parse(playlistRequest.responseText)
            console.log(playlistResponse)
            playlistID = playlistResponse.id
            fillPlaylist()
        }
    }
}

function fillPlaylist() {
    let JSONTrackBody = JSON.stringify(buildTrackJSON())
    let addTrackRequest = new XMLHttpRequest()
    addTrackRequest.open("POST", "https://api.spotify.com/v1/playlists/" + playlistID + "/tracks")
    addTrackRequest.setRequestHeader("Authorization", "Bearer " + access_token)
    addTrackRequest.setRequestHeader("content-type", "application/json")
    addTrackRequest.send(JSONTrackBody)
    alert("Playlist successfully created!")
}

