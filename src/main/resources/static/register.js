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

    const fullName = nameInput.value.trim();
    const email = emailInput.value.trim();

    const nameParts = fullName.split(/\s+/);

    if (fullName === "") {
        registerMessage.textContent = "Debe ingresar su nombre completo";
        registerMessage.className = "auth-message error";
        nameInput.focus();
        return;
    }

    if (nameParts.length < 2) {
        registerMessage.textContent = "Debe ingresar nombre y apellido";
        registerMessage.className = "auth-message error";
        nameInput.focus();
        return;
    }

    if (email === "") {
        registerMessage.textContent = "Debe ingresar un email";
        registerMessage.className = "auth-message error";
        emailInput.focus();
        return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
        registerMessage.textContent = "El email debe tener un formato válido";
        registerMessage.className = "auth-message error";
        emailInput.focus();
        return;
    }

    if (passwordInput.value === "") {
        registerMessage.textContent = "Debe ingresar una contraseña";
        registerMessage.className = "auth-message error";
        passwordInput.focus();
        return;
    }

    if (confirmPasswordInput.value === "") {
        registerMessage.textContent = "Debe confirmar la contraseña";
        registerMessage.className = "auth-message error";
        confirmPasswordInput.focus();
        return;
    }

    if (passwordInput.value !== confirmPasswordInput.value) {
        registerMessage.textContent = "Las contraseñas no coinciden";
        registerMessage.className = "auth-message error";
        confirmPasswordInput.focus();
        return;
    }

    const registerData = {
        name: fullName,
        email: email,
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

        nameInput.value = "";
        emailInput.value = "";
        passwordInput.value = "";
        confirmPasswordInput.value = "";

        setTimeout(function () {
            window.location.href = "index.html";
        }, 1500);

    } catch (error) {
        registerMessage.textContent = error.message;
        registerMessage.className = "auth-message error";
    }
}