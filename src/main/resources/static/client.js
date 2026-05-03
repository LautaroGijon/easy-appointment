document.addEventListener("DOMContentLoaded", function () {
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

    if (!loggedUser) {
        window.location.href = "index.html";
        return;
    }

    if (loggedUser.role === "ADMIN") {
        window.location.href = "admin.html";
        return;
    }

    const welcomeMessage = document.getElementById("welcomeMessage");
    const logoutButton = document.getElementById("logoutButton");
    const appointmentForm = document.getElementById("appointmentForm");
    
    welcomeMessage.textContent = `Bienvenido, ${loggedUser.name}`;

    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("loggedUser");
        window.location.href = "index.html";
    });

    appointmentForm.addEventListener("submit", createAppointment);
    

    loadServicesOptions();
    loadProfessionalsOptions();
    loadAppointments();
});

async function loadProfessionalsOptions() {
    const professionalSelect = document.getElementById("appointmentProfessional");
    const appointmentMessage = document.getElementById("appointmentMessage");

    try {
        const response = await fetch("/api/professionals");

        if (!response.ok) {
            throw new Error("No se pudieron cargar los profesionales");
        }

        const professionals = await response.json();

        professionalSelect.innerHTML = '<option value="">Seleccione un profesional</option>';

        professionals.forEach(function (professional) {
            const option = document.createElement("option");

            option.value = professional.id;
            option.textContent = `${professional.firstName} ${professional.lastName}`;

            professionalSelect.appendChild(option);
        });

    } catch (error) {
        appointmentMessage.textContent = error.message;
    }
}

async function loadServicesOptions() {
    const serviceSelect = document.getElementById("appointmentService");
    const appointmentMessage = document.getElementById("appointmentMessage");

    try {
        const response = await fetch("/api/offered-services");

        if (!response.ok) {
            throw new Error("No se pudieron cargar los servicios");
        }

        const services = await response.json();

        serviceSelect.innerHTML = '<option value="">Seleccione un servicio</option>';

        services.forEach(function (service) {
            const option = document.createElement("option");

            option.value = service.id;
            option.textContent = `${service.name} - $${service.price}`;

            serviceSelect.appendChild(option);
        });

    } catch (error) {
        appointmentMessage.textContent = error.message;
    }
}

async function createAppointment(event) {
    event.preventDefault();

    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

    const professionalSelect = document.getElementById("appointmentProfessional");
    const dateInput = document.getElementById("appointmentDate");
    const timeInput = document.getElementById("appointmentTime");
    const appointmentMessage = document.getElementById("appointmentMessage");
    const serviceSelect = document.getElementById("appointmentService");
    appointmentMessage.textContent = "";

    const appointment = {
    clientId: loggedUser.id,
    serviceId: Number(serviceSelect.value),
    professionalId: Number(professionalSelect.value),
    date: dateInput.value,
    time: timeInput.value
};

    try {
        const response = await fetch("/api/appointments", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(appointment)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "No se pudo reservar el turno");
        }

        appointmentMessage.textContent = "Turno reservado correctamente";
        
        serviceSelect.value = "";
        professionalSelect.value = "";
        dateInput.value = "";
        timeInput.value = "";
        

        loadAppointments();

    } catch (error) {
        appointmentMessage.textContent = error.message;
    }
}

async function loadAppointments() {
    const appointmentsList = document.getElementById("appointmentsList");
    const appointmentsMessage = document.getElementById("appointmentsMessage");
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

    appointmentsMessage.textContent = "Cargando turnos...";
    appointmentsList.innerHTML = "";

    try {
        const response = await fetch("/api/appointments");

        if (!response.ok) {
            throw new Error("No se pudieron cargar los turnos");
        }

        const appointments = await response.json();

        const clientAppointments = appointments.filter(function (appointment) {
            return appointment.client && appointment.client.id === loggedUser.id;
        });

        renderAppointments(clientAppointments);

        appointmentsMessage.textContent = "";

    } catch (error) {
        appointmentsMessage.textContent = error.message;
    }
}

function renderAppointments(appointments) {
    const appointmentsList = document.getElementById("appointmentsList");

    appointmentsList.innerHTML = "";

    if (appointments.length === 0) {
        appointmentsList.innerHTML = "<li>No tenés turnos cargados</li>";
        return;
    }

    appointments.forEach(function (appointment) {
        const li = document.createElement("li");
        li.classList.add("appointment-item");

        const appointmentInfo = document.createElement("div");
        appointmentInfo.classList.add("appointment-info");

        const professionalName = `${appointment.professional.firstName} ${appointment.professional.lastName}`;


        const serviceName = appointment.offeredService
    ? appointment.offeredService.name
    : "Sin servicio";

        appointmentInfo.innerHTML = `
    <p><strong>Servicio:</strong> ${serviceName}</p>
    <p><strong>Profesional:</strong> ${professionalName}</p>
    <p><strong>Fecha:</strong> ${appointment.date}</p>
    <p><strong>Hora:</strong> ${appointment.time}</p>
    <p><strong>Estado:</strong> <span class="status ${appointment.status.toLowerCase()}">${appointment.status}</span></p>
`;

        li.appendChild(appointmentInfo);

        if (appointment.status === "ACTIVE") {
            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Cancelar";

            cancelButton.addEventListener("click", function () {
                cancelAppointment(appointment.id);
            });

            li.appendChild(cancelButton);
        }

        appointmentsList.appendChild(li);
    });
}

async function cancelAppointment(id) {
    const appointmentsMessage = document.getElementById("appointmentsMessage");

    try {
        const response = await fetch(`/api/appointments/${id}/cancel`, {
            method: "PUT"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "No se pudo cancelar el turno");
        }

        appointmentsMessage.textContent = "Turno cancelado correctamente";

        loadAppointments();

    } catch (error) {
        appointmentsMessage.textContent = error.message;
    }
}