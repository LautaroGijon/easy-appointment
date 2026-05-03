document.addEventListener("DOMContentLoaded", function () {
    const registerForm = document.getElementById("registerForm");

    registerForm.addEventListener("submit", register);
});

async function register(event) {
    event.preventDefault();

    const nameInput = document.getElementById("registerName");
    const emailInput = document.getElementById("registerEmail");
    const passwordInput = document.getElementById("registerPassword");
    const confirmPasswordInput = document.getElementById("registerConfirmPassword");
    const registerMessage = document.getElementById("registerMessage");

    registerMessage.textContent = "";
    registerMessage.className = "auth-message";

    if (passwordInput.value !== confirmPasswordInput.value) {
        registerMessage.textContent = "Las contraseñas no coinciden";
        registerMessage.className = "auth-message error";
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(emailInput.value)) {
        registerMessage.textContent = "El email debe tener un formato válido";
        registerMessage.className = "auth-message error";
        return;
    }

    const registerData = {
        name: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value
    };

    try {
        const response = await fetch("/api/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registerData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "No se pudo crear la cuenta");
        }

        registerMessage.textContent = "Cuenta creada correctamente. Redirigiendo al login...";
        registerMessage.className = "auth-message success";

        setTimeout(function () {
            window.location.href = "index.html";
        }, 1500);

    } catch (error) {
        registerMessage.textContent = error.message;
        registerMessage.className = "auth-message error";
    }
}