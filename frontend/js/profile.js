
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

async function register() {
    const name = get("registerName").value.trim();
    const email = get("registerEmail").value.trim();
    const password = get("registerPassword").value.trim();

    if (!name || !email || !password) {
        alert("Please fill in all fields!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ name, email, password })
        });

        if (res.ok) {
            alert("Registered successfully!");
            showLogin();
        } else {
            const data = await res.json();
            alert(data.message || "Failed to register. Please try again later.");
        }
    } catch (error) {console.error('error');}
}

async function login() {
    const email = get("loginEmail").value.trim();
    const password = get("loginPassword").value.trim();
    
    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email, password })
        });
        const data = await res.json();

        if (res.ok) {

            localStorage.setItem('authToken', data.token);// Store token for future authenticated requests
            localStorage.setItem('user', JSON.stringify(data.user)); // Store user data for role-based UI adjustments

            get("loginForm").style.display = "none";
            get("profileSection").style.display = "block";
            get("profileName").innerText = data.user.name;
            get("profileEmail").innerText = data.user.email;
            get("profilePassword").innerText = "••••••••";
            get("welcomeText").innerText = "Welcome " + data.user.name;

            //instant unhide
            if (data.user.role === 'admin' || data.user.isAdmin === true) {
                const adminLink = document.getElementById('admin-nav-item');
                if (adminLink) {
                    adminLink.style.display = 'block'; // (or 'flex', depending on your CSS)
                }
            }
        } else {
            alert("Wrong email or password!");
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


let editType = ""; 
function enableEdit(type) {
    editType = type;
    get("editBox").style.display = "block";

    if (type === "name")     get("editInput").value = get("profileName").innerText;
    if (type === "email")    get("editInput").value = get("profileEmail").innerText;
    if (type === "password") get("editInput").value = ""; // Don't pre-fill password for security reasons
}



async function saveEdit() {
    const newValue = get("editInput").value.trim();

    if (!newValue) {
        alert("Field cannot be empty!");
        return;
    }

    //prepare the exact data payload we want to send to the backend based on the edit type
    let updatePayload = {};

    if (editType === "name") {
        updatePayload = { name: newValue };
    }

    if (editType === "email") {
        if (!newValue.includes("@")) {
            alert("Please enter a valid email.");
            return;
        }
        updatePayload = { email: newValue };
    }

    if (editType === "password") {
        updatePayload = { password: newValue };
    }
    
    //send the update request to the backend
    try {
        const res = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(updatePayload)
        });
        if (res.ok) {

            if (editType === "name") {
                get("profileName").innerText = newValue;
                get("welcomeText").innerText = "Welcome " + newValue;
            }
            if (editType === "email") {
                get("profileEmail").innerText = newValue;
            }
            if (editType === "password") {
                get("profilePassword").innerText = "••••••••";
                alert("Password updated successfully!");
            }
            //hide the edit box after successful update
            get("editBox").style.display = "none";
            get("editInput").value = "";
        } else {
            alert("Failed to update profile. Please try again later.");
        }
    } catch (error) {
        console.error('Error updating profile:', error);
    }
}

function logout() {
    localStorage.removeItem('authToken');// Clear auth token from localStorage
    localStorage.removeItem('user');// Clear user data from localStorage
    
    alert("Logged out successfully!");
    window.location.reload();
}


//added to check if user is already logged in and adjust UI accordingly
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('authToken');
    const user = JSON.parse(localStorage.getItem('user'));

    if (token && user) {
        get("registerForm").style.display = "none";
        get("loginForm").style.display = "none";
        get("profileSection").style.display = "block";
        get("profileName").innerText = user.name;
        get("profileEmail").innerText = user.email;
        get("profilePassword").innerText = "••••••••";
        get("welcomeText").innerText = "Welcome " + user.name;

        
    }
});