const URL = window.location.href

let access_token = ""
let user_country = ""
let user_name = ""
let user_id = ""

if (URL.lastIndexOf("access_token") < 0) {
    if (confirm("you need an access token to continue, do you want to get one?")) {
        window.open("https://accounts.spotify.com/authorize?client_id=b12e7cbb42944fbbbfd1756a0ad6e3fc&response_type=token&redirect_uri=" + URL.replaceAll("/", "%2F") +
            "&scope=user-read-private%20playlist-modify-public", "_self")
    } else {
        alert("No access token, No access! \n Page will close now!")
        this.close()
    }
} else {
    getAccessToken(window.location.hash)
    getUserData()
}

function getAccessToken(hash) {
    hash = hash.substr(1)
    let queries = hash.split("&")
    for (let i = 0; i < queries.length; i++) {
        let query = queries[i].split("=")
        if (query[0] = "access_token") {
            access_token = query[1]
            break
        }
    }
}

function getUserData() {
    let dataRequest = new XMLHttpRequest()
    dataRequest.open("GET", "https://api.spotify.com/v1/me");
    dataRequest.setRequestHeader("Authorization", "Bearer " + access_token)
    dataRequest.send()
    dataRequest.onreadystatechange = function () {
        if (dataRequest.readyState == XMLHttpRequest.DONE && dataRequest.status == 200) {
            let response = JSON.parse(dataRequest.responseText);
            user_country = response.country
            user_name = response.display_name
            document.getElementById("welcomeTitle").textContent = "Welcome " + user_name.substr(0, 20)
            user_id = response.id
        } else if (dataRequest.readyState == XMLHttpRequest.DONE && dataRequest.status == 401) {
            if (confirm("Token has expired or is invalid, do you want to get a new one?")) {
                window.open("https://accounts.spotify.com/authorize?client_id=b12e7cbb42944fbbbfd1756a0ad6e3fc&response_type=token&redirect_uri=" + URL.replaceAll("/", "%2F") +
                    "&scope=user-read-private%20playlist-modify-public", "_self")
            }
        }
    }
}
