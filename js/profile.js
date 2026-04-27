
function get(id) {
    return document.getElementById(id);
}

function showLogin() {
    get("registerForm").style.display = "none";
    get("loginForm").style.display = "block";
}

function showRegister() {
    get("registerForm").style.display = "block";
    get("loginForm").style.display = "none";
}

function register() {
    const name = get("username").value.trim();
    const email = get("registerEmail").value.trim();
    const password = get("registerPassword").value.trim();

    if (!name || !email || !password) {
        alert("Please fill in all fields!");
        return;
    }

    if (!email.includes("@")) {
        alert("Please enter a valid email.");
        return;
    }
    const user = { name, email, password };
    localStorage.setItem("user", JSON.stringify(user));

    alert("Registered successfully!");
    showLogin();
}

function login() {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("No account found. Please register first.");
        return;
    }

    const enteredEmail = get("loginEmail").value;
    const enteredPassword = get("loginPassword").value;

    if (enteredEmail === user.email && enteredPassword === user.password) {

        get("loginForm").style.display = "none";
        get("registerForm").style.display = "none";
        get("profileSection").style.display = "block";

        get("profileName").innerText = user.name;
        get("profileEmail").innerText = user.email;
        get("profilePassword").innerText = "••••••••";
        get("welcomeText").innerText = "Welcome " + user.name;
    } else {
        alert("Wrong email or password!");
    }
}


let editType = ""; 
function enableEdit(type) {
    editType = type;

    const user = JSON.parse(localStorage.getItem("user"));


    get("editBox").style.display = "block";

    if (type === "name")     get("editInput").value = user.name;
    if (type === "email")    get("editInput").value = user.email;
    if (type === "password") get("editInput").value = user.password;
}



function saveEdit() {
    const user = JSON.parse(localStorage.getItem("user"));
    const newValue = get("editInput").value.trim();

    if (!newValue) {
        alert("Field cannot be empty!");
        return;
    }

    if (editType === "name") {
        user.name = newValue;
        get("profileName").innerText = newValue;
        get("welcomeText").innerText = "Welcome " + newValue;
    }

    if (editType === "email") {
        if (!newValue.includes("@")) {
            alert("Please enter a valid email.");
            return;
        }
        user.email = newValue;
        get("profileEmail").innerText = newValue;
    }

    if (editType === "password") {
        user.password = newValue;
        get("profilePassword").innerText = "••••••••";
    }
    localStorage.setItem("user", JSON.stringify(user));
    get("editBox").style.display = "none";
}

function logout() {
    get("profileSection").style.display = "none";
    get("loginForm").style.display = "block";
}


function goToOrders() {
    alert("Orders page will be linked later!");
}
