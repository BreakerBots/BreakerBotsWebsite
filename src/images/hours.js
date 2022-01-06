const password = "9fb9297d179a9e2341c9562f94e88b76d6a3c45fdb3a0cbaca832a22aa99b7b2";

async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);                    

    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));

    // convert bytes to hex string
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

async function signIn(password){
    const hash = await sha256(password);
    if (hash === password) {
        localStorage.setItem("hash", hash);
        window.location.href = "hours/meeting";
    }
}

