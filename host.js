
var secretPassphrase = ""

function sendSecretPassphrase() {
    secretPassphrase = document.getElementById("password-input").value;
    document.getElementById("password-input").value = "";

    // TODO: for now, just send the password via plaintext -> in the future, the user asks server for a random string, then we encode that passphrase using our guess as to what the key is

    // NOTE: this should work
    /*
    var passphrase = 'default';//document.getElementById("password-input").value;
    passphrase = CryptoJS.SHA256(passphrase)

    var KEY = passphrase.toString();//'ddfbccae-b4c4-11';
    var IV = passphrase.toString();//'ddfbccae-b4c4-11';

    console.log(passphrase.toString());
    console.log(passphrase.toString(CryptoJS.Base64));

    var plaintext = "msg";
    var input_bytes = CryptoJS.enc.Utf8.parse(plaintext);
    var key = CryptoJS.enc.Utf8.parse(KEY);
    var options = {iv: CryptoJS.enc.Utf8.parse(IV), mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7};
    var encrypted = CryptoJS.AES.encrypt(input_bytes, key, options);
    console.log(encrypted.ciphertext.toString()); // this is the value you send over the wire
    */

    //var encrypted_b64 = btoa(encrypted);
    //console.log(encrypted_b64); 

    /*
    let passphrase = document.getElementById("password-input").value;
    let encrypted = CryptoJS.AES.encrypt("msg", utf8Encode.encode(passphrase)); // Let's go!??!!?
    console.log(encrypted);
    console.log(btoa(encrypted.iv));
    console.log(btoa(encrypted.key));
    console.log(btoa(encrypted.salt));
    */

    let serverIp = "http://34.82.79.41:7555";
    
    var xhr = new XMLHttpRequest();
    // encrypted password
    xhr.open("GET", serverIp + "/host?pwd=" + secretPassphrase, true); // will need to send pwd with every request -> just... https?
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() { 
        if(xhr.readyState == 4 && xhr.status == 200) {
            let responseList = xhr.responseText.split("\n");
            console.log(responseList);

            document.getElementById("maps").innerHTML = "";

            if (responseList.length > 1 && responseList[1] == "right pass") {
                responseList.slice(2).forEach(line => {
                    let mapList = line.split("#")
                    let name = mapList[0];
                    let pointString = mapList[1];
                    let edgeString = mapList[2];
                
                    let tmp = "<div style=\"margin: 8px; padding: 8px; background-color: #def\">";
                    tmp += "<h4>Map Name: " + name + "</h4>";
                    tmp += "<div style=\"width: 200px; height: 200px; margin: 8px; background-color: #fff; padding: 4px;\">" + pointString + "</div>"
                    tmp += "</div>";

                    console.log(tmp);

                    document.getElementById("maps").innerHTML += tmp;
                });

                // add all the cards in a for loop -> make them editable via js
                
            } else {
                console.log("wrong pass");
            }
            
        }
    }
    xhr.send();
    
}
