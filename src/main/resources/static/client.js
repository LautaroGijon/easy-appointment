let allClientAppointments = [];

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
    const dateInput = document.getElementById("appointmentDate");
    const clientAppointmentStatusFilter = document.getElementById("clientAppointmentStatusFilter");

    dateInput.min = getTodayLocalDate();

    welcomeMessage.textContent = `Bienvenido, ${loggedUser.name}`;

    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("loggedUser");
        window.location.href = "index.html";
    });

    appointmentForm.addEventListener("submit", createAppointment);
    clientAppointmentStatusFilter.addEventListener("change", renderFilteredClientAppointments);

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
        showMessage(appointmentMessage, error.message, "error");
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
        showMessage(appointmentMessage, error.message, "error");
    }
}

async function createAppointment(event) {
    event.preventDefault();

    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

    const serviceSelect = document.getElementById("appointmentService");
    const professionalSelect = document.getElementById("appointmentProfessional");
    const dateInput = document.getElementById("appointmentDate");
    const timeInput = document.getElementById("appointmentTime");
    const appointmentMessage = document.getElementById("appointmentMessage");

    clearMessage(appointmentMessage);

    if (serviceSelect.value === "") {
        showMessage(appointmentMessage, "Debe seleccionar un servicio", "error");
        serviceSelect.focus();
        return;
    }

    if (professionalSelect.value === "") {
        showMessage(appointmentMessage, "Debe seleccionar un profesional", "error");
        professionalSelect.focus();
        return;
    }

    if (dateInput.value === "") {
        showMessage(appointmentMessage, "Debe seleccionar una fecha", "error");
        dateInput.focus();
        return;
    }

    if (timeInput.value === "") {
        showMessage(appointmentMessage, "Debe seleccionar una hora", "error");
        timeInput.focus();
        return;
    }

    const today = getTodayLocalDate();

    if (dateInput.value < today) {
        showMessage(appointmentMessage, "No se puede reservar un turno en una fecha pasada", "error");
        dateInput.focus();
        return;
    }

    const currentTime = getCurrentLocalTime();

    if (dateInput.value === today && timeInput.value < currentTime) {
        showMessage(appointmentMessage, "No se puede reservar un turno en una hora pasada", "error");
        timeInput.focus();
        return;
    }

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

        showMessage(appointmentMessage, "Turno reservado correctamente", "success");

        serviceSelect.value = "";
        professionalSelect.value = "";
        dateInput.value = "";
        timeInput.value = "";

        await loadAppointments(false);

    } catch (error) {
        showMessage(appointmentMessage, error.message, "error");
    }
}

async function loadAppointments(showLoading = true) {
    const appointmentsList = document.getElementById("appointmentsList");
    const appointmentsMessage = document.getElementById("appointmentsMessage");
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

    if (showLoading) {
        showMessage(appointmentsMessage, "Cargando turnos...", "info");
    }

    appointmentsList.innerHTML = "";

    try {
        const response = await fetch("/api/appointments");

        if (!response.ok) {
            throw new Error("No se pudieron cargar los turnos");
        }

        const appointments = await response.json();

        allClientAppointments = appointments.filter(function (appointment) {
            return appointment.client && appointment.client.id === loggedUser.id;
        });

        sortClientAppointments();
        renderFilteredClientAppointments();

        if (showLoading) {
            clearMessage(appointmentsMessage);
        }

    } catch (error) {
        showMessage(appointmentsMessage, error.message, "error");
    }
}

function renderFilteredClientAppointments() {
    const clientAppointmentStatusFilter = document.getElementById("clientAppointmentStatusFilter");

    let filteredAppointments = allClientAppointments;

    if (clientAppointmentStatusFilter.value !== "ALL") {
        filteredAppointments = allClientAppointments.filter(function (appointment) {
            return appointment.status === clientAppointmentStatusFilter.value;
        });
    }

    renderAppointments(filteredAppointments);
}

function sortClientAppointments() {
    allClientAppointments.sort(function (a, b) {
        if (a.status === "ACTIVE" && b.status !== "ACTIVE") {
            return -1;
        }

        if (a.status !== "ACTIVE" && b.status === "ACTIVE") {
            return 1;
        }

        const dateTimeA = `${a.date} ${a.time}`;
        const dateTimeB = `${b.date} ${b.time}`;

        return dateTimeA.localeCompare(dateTimeB);
    });
}

function renderAppointments(appointments) {
    const appointmentsList = document.getElementById("appointmentsList");

    appointmentsList.innerHTML = "";

    if (appointments.length === 0) {
        const filter = document.getElementById("clientAppointmentStatusFilter").value;

        let emptyTitle = "No hay turnos para mostrar";
        let emptyText = "Cuando reserves un turno, aparecerá en esta sección.";

        if (filter === "ACTIVE") {
            emptyTitle = "No tenés turnos activos";
            emptyText = "Los turnos pendientes de atención aparecerán acá.";
        }

        if (filter === "CANCELLED") {
            emptyTitle = "No tenés turnos cancelados";
            emptyText = "Los turnos que canceles aparecerán acá.";
        }

        appointmentsList.innerHTML = `
            <li class="empty-appointments">
                <div class="empty-icon">📅</div>
                <strong>${emptyTitle}</strong>
                <span>${emptyText}</span>
            </li>
        `;
        return;
    }

    appointments.forEach(function (appointment) {
        const li = document.createElement("li");
        li.classList.add("appointment-item");
        li.classList.add(`appointment-${appointment.status.toLowerCase()}`);

        const professionalName = `${appointment.professional.firstName} ${appointment.professional.lastName}`;

        const serviceName = appointment.offeredService
            ? appointment.offeredService.name
            : "Sin servicio";

        const appointmentInfo = document.createElement("div");
        appointmentInfo.classList.add("appointment-info");

        appointmentInfo.innerHTML = `
            <div class="appointment-card-header">
                <div>
                    <span class="appointment-service-name">${serviceName}</span>
                    <p class="appointment-professional-name">${professionalName}</p>
                </div>

                <span class="status ${appointment.status.toLowerCase()}">
                    ${getStatusLabel(appointment.status)}
                </span>
            </div>

            <div class="appointment-details-grid">
                <div class="appointment-detail">
                    <span>Fecha</span>
                    <strong>${formatDate(appointment.date)}</strong>
                </div>

                <div class="appointment-detail">
                    <span>Hora</span>
                    <strong>${formatTime(appointment.time)}</strong>
                </div>
            </div>
        `;

        li.appendChild(appointmentInfo);

        if (appointment.status === "ACTIVE") {
            const actions = document.createElement("div");
            actions.classList.add("appointment-actions");

            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Cancelar turno";
            cancelButton.classList.add("cancel-appointment-button");

            cancelButton.addEventListener("click", function () {
                cancelAppointment(appointment.id);
            });

            actions.appendChild(cancelButton);
            li.appendChild(actions);
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

        await loadAppointments(false);

        showMessage(appointmentsMessage, "Turno cancelado correctamente", "success");

    } catch (error) {
        showMessage(appointmentsMessage, error.message, "error");
    }
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `form-message ${type}`;
}

function clearMessage(element) {
    element.textContent = "";
    element.className = "form-message";
}

function getTodayLocalDate() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function getCurrentLocalTime() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${hours}:${minutes}`;
}

function formatDate(date) {
    if (!date) {
        return "";
    }

    const parts = date.split("-");
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatTime(time) {
    if (!time) {
        return "";
    }

    return time.substring(0, 5);
}

function getStatusLabel(status) {
    if (status === "ACTIVE") {
        return "Activo";
    }

    if (status === "CANCELLED") {
        return "Cancelado";
    }

    return status;
}

