var player_uid = -1

function joinGame() {
    if (document.getElementById('name').value == "") {
        alert("put in a name first please")
        return;
    }

    let serverIp = "https://34.82.79.41:7555";

    var xhr = new XMLHttpRequest();
    xhr.open("GET", serverIp + "/joingame?name=" + document.getElementById('name').value, true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() { 
        // 4 means done
        if(xhr.readyState == 4 && xhr.status == 200) {
            console.log(xhr.responseText)
            player_uid = parseInt(xhr.responseText);
            console.log("success joining game!\n")
            console.log(player_uid)
        } else {
            console.log("game joining statusText: " + xhr.statusText);
        }
    }

    xhr.send();
}