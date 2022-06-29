
function sendSecretPassphrase() {

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
    xhr.open("GET", serverIp + "/host?pwd=" + document.getElementById("password-input").value, true);
    xhr.setRequestHeader('Content-Type', 'text/plain');
    xhr.onreadystatechange = function() { 
        if(xhr.readyState == 4 && xhr.status == 200) {
            console.log("pass-responseText: " + xhr.responseText);
        }
       //console.log("pass-statusText: " + xhr.statusText);
    }
    xhr.send();
    
}
