document.getElementById("join-lobby").onclick = () => {
    let name = document.getElementById("join-name").value;
    
    if (name == "") {
        alert("insert valid name");
        return;
    }

    console.log("TODO: join lobby " + name);

    // TODO: ask server if this name has been taken or not

    // TODO: after a player has successfully joined the lobby, change the button "join lobby" to "change name"
    
    // TODO: also, an "[I'm Ready]" button will appear to the left of the player's name, which can be toggled. The game can be run at any time, but it's helpful to the admin to know exactly when everyone is ready!
}