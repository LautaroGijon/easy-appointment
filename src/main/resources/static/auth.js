document.addEventListener("DOMContentLoaded", function () {
    const loginForm = document.getElementById("loginForm");

    loginForm.addEventListener("submit", login);
});

async function login(event) {
    event.preventDefault();

    const emailInput = document.getElementById("loginEmail");
    const passwordInput = document.getElementById("loginPassword");
    const loginMessage = document.getElementById("loginMessage");

    loginMessage.textContent = "";
    loginMessage.className = "auth-message";

    const loginData = {
        email: emailInput.value,
        password: passwordInput.value
    };

    try {
        const response = await fetch("/api/auth/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "No se pudo iniciar sesión");
        }

        localStorage.setItem("loggedUser", JSON.stringify(data));

        if (data.role === "ADMIN") {
            window.location.href = "admin.html";
        } else {
            window.location.href = "home.html";
        }

    } catch (error) {
        loginMessage.textContent = error.message;
        loginMessage.className = "auth-message error";
    }
}