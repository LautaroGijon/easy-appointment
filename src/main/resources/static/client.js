const API_APPOINTMENTS = "/api/appointments";
const API_SERVICES = "/api/offered-services";
const API_PROFESSIONALS = "/api/professionals";

const user = JSON.parse(localStorage.getItem("loggedUser"));

const welcomeMessage = document.getElementById("welcomeMessage");
const logoutButton = document.getElementById("logoutButton");

const appointmentForm = document.getElementById("appointmentForm");
const appointmentService = document.getElementById("appointmentService");
const appointmentProfessional = document.getElementById("appointmentProfessional");
const appointmentDate = document.getElementById("appointmentDate");
const appointmentTime = document.getElementById("appointmentTime");
const appointmentMessage = document.getElementById("appointmentMessage");
const appointmentSubmitButton = document.getElementById("appointmentSubmitButton");
const cancelEditButton = document.getElementById("cancelEditButton");

const appointmentsList = document.getElementById("appointmentsList");
const appointmentsMessage = document.getElementById("appointmentsMessage");
const clientAppointmentStatusFilter = document.getElementById("clientAppointmentStatusFilter");

let allAppointments = [];
let editingAppointmentId = null;

document.addEventListener("DOMContentLoaded", async function () {
    if (!validateSession()) {
        return;
    }

    setWelcomeMessage();
    setMinimumDate();

    await loadServices();
    await loadProfessionals();
    await loadAppointments();
});

function validateSession() {
    if (!user) {
        window.location.href = "index.html";
        return false;
    }

    if (user.role !== "CLIENT") {
        window.location.href = "admin.html";
        return false;
    }

    return true;
}

function setWelcomeMessage() {
    welcomeMessage.textContent = `Bienvenido, ${user.name || user.fullName || "Cliente"}`;
}

function setMinimumDate() {
    const today = new Date().toISOString().split("T")[0];
    appointmentDate.setAttribute("min", today);
}

logoutButton.addEventListener("click", function () {
    localStorage.removeItem("loggedUser");
    window.location.href = "index.html";
});

async function loadServices() {
    try {
        const response = await fetch(API_SERVICES);

        if (!response.ok) {
            throw new Error("No se pudieron cargar los servicios");
        }

        const services = await response.json();

        appointmentService.innerHTML = `<option value="">Seleccione un servicio</option>`;

        services.forEach(function (service) {
            const option = document.createElement("option");
            option.value = service.id;
            option.textContent = `${service.name} - ${service.durationMinutes} min - $${service.price}`;
            appointmentService.appendChild(option);
        });

    } catch (error) {
        showMessage(appointmentMessage, error.message, "error");
    }
}

async function loadProfessionals() {
    try {
        const response = await fetch(API_PROFESSIONALS);

        if (!response.ok) {
            throw new Error("No se pudieron cargar los profesionales");
        }

        const professionals = await response.json();

        appointmentProfessional.innerHTML = `<option value="">Seleccione un profesional</option>`;

        professionals.forEach(function (professional) {
            const option = document.createElement("option");
            option.value = professional.id;
            option.textContent = `${professional.firstName} ${professional.lastName}`;
            appointmentProfessional.appendChild(option);
        });

    } catch (error) {
        showMessage(appointmentMessage, error.message, "error");
    }
}

appointmentForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const selectedServiceId = appointmentService.value;
    const selectedProfessionalId = appointmentProfessional.value;
    const selectedDate = appointmentDate.value;
    const selectedTime = appointmentTime.value;

    if (!selectedServiceId || !selectedProfessionalId || !selectedDate || !selectedTime) {
        showMessage(appointmentMessage, "Completá todos los campos para continuar", "error");
        return;
    }

    const requestBody = buildAppointmentRequest(
        selectedServiceId,
        selectedProfessionalId,
        selectedDate,
        selectedTime
    );

    const url = editingAppointmentId
        ? `${API_APPOINTMENTS}/${editingAppointmentId}`
        : API_APPOINTMENTS;

    const method = editingAppointmentId ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorMessage = await getErrorMessage(response);
            throw new Error(errorMessage);
        }

        if (editingAppointmentId) {
            showMessage(appointmentMessage, "Turno reprogramado correctamente", "success");
        } else {
            showMessage(appointmentMessage, "Turno reservado correctamente", "success");
        }

        resetAppointmentFormMode();
        await loadAppointments();

    } catch (error) {
        showMessage(appointmentMessage, error.message, "error");
    }
});

function buildAppointmentRequest(serviceId, professionalId, date, time) {
    if (editingAppointmentId) {
        return {
            serviceId: Number(serviceId),
            professionalId: Number(professionalId),
            date: date,
            time: time
        };
    }

    return {
        clientId: user.id,
        serviceId: Number(serviceId),
        professionalId: Number(professionalId),
        date: date,
        time: time
    };
}

async function loadAppointments() {
    try {
        const response = await fetch(API_APPOINTMENTS);

        if (!response.ok) {
            throw new Error("No se pudieron cargar los turnos");
        }

        const appointments = await response.json();

        allAppointments = appointments.filter(function (appointment) {
            return appointment.client && appointment.client.id === user.id;
        });

        renderAppointments();

    } catch (error) {
        showMessage(appointmentsMessage, error.message, "error");
    }
}

clientAppointmentStatusFilter.addEventListener("change", renderAppointments);

function renderAppointments() {
    appointmentsList.innerHTML = "";
    appointmentsMessage.textContent = "";
    appointmentsMessage.className = "form-message";

    const selectedStatus = clientAppointmentStatusFilter.value;

    const filteredAppointments = allAppointments.filter(function (appointment) {
        if (selectedStatus === "ALL") {
            return true;
        }

        return appointment.status === selectedStatus;
    });

    filteredAppointments.sort(function (a, b) {
        const dateTimeA = `${a.date} ${formatTime(a.time)}`;
        const dateTimeB = `${b.date} ${formatTime(b.time)}`;
        return dateTimeA.localeCompare(dateTimeB);
    });

    if (filteredAppointments.length === 0) {
        renderEmptyAppointments();
        return;
    }

    filteredAppointments.forEach(function (appointment) {
        const appointmentItem = createAppointmentItem(appointment);
        appointmentsList.appendChild(appointmentItem);
    });
}

function createAppointmentItem(appointment) {
    const item = document.createElement("li");
    item.classList.add("appointment-item");

    if (appointment.status === "CANCELLED") {
        item.classList.add("appointment-cancelled");
    }

    const serviceName = appointment.offeredService
        ? appointment.offeredService.name
        : "Servicio no disponible";

    const professionalName = appointment.professional
        ? `${appointment.professional.firstName} ${appointment.professional.lastName}`
        : "Profesional no disponible";

    const statusClass = getStatusClass(appointment.status);
    const statusLabel = getStatusLabel(appointment.status);

    item.innerHTML = `
        <div class="appointment-info">
            <div class="appointment-card-header">
                <div>
                    <span class="appointment-service-name">${serviceName}</span>
                    <p class="appointment-professional-name">${professionalName}</p>
                </div>

                <span class="status ${statusClass}">${statusLabel}</span>
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
        </div>
    `;

    if (appointment.status === "ACTIVE") {
        const actionsContainer = document.createElement("div");
        actionsContainer.classList.add("appointment-actions");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Reprogramar";
        editButton.classList.add("edit-appointment-button");

        editButton.addEventListener("click", function () {
            startEditAppointment(appointment);
        });

        const cancelButton = document.createElement("button");
        cancelButton.type = "button";
        cancelButton.textContent = "Cancelar turno";
        cancelButton.classList.add("cancel-appointment-button");

        cancelButton.addEventListener("click", function () {
            cancelAppointment(appointment.id);
        });

        actionsContainer.appendChild(editButton);
        actionsContainer.appendChild(cancelButton);
        item.appendChild(actionsContainer);
    }

    return item;
}

function startEditAppointment(appointment) {
    editingAppointmentId = appointment.id;

    appointmentService.value = appointment.offeredService.id;
    appointmentProfessional.value = appointment.professional.id;
    appointmentDate.value = appointment.date;
    appointmentTime.value = formatTime(appointment.time);

    appointmentSubmitButton.textContent = "Guardar cambios";
    cancelEditButton.classList.remove("hidden");

    showMessage(appointmentMessage, "Estás reprogramando un turno", "success");

    window.scrollTo({
        top: appointmentForm.offsetTop - 160,
        behavior: "smooth"
    });
}

cancelEditButton.addEventListener("click", function () {
    resetAppointmentFormMode();
});

function resetAppointmentFormMode() {
    editingAppointmentId = null;

    appointmentForm.reset();

    appointmentSubmitButton.textContent = "Reservar turno";
    cancelEditButton.classList.add("hidden");

    appointmentMessage.textContent = "";
    appointmentMessage.className = "form-message";

    setMinimumDate();
}

async function cancelAppointment(id) {
    const confirmCancel = confirm("¿Seguro que querés cancelar este turno?");

    if (!confirmCancel) {
        return;
    }

    try {
        const response = await fetch(`${API_APPOINTMENTS}/${id}/cancel`, {
            method: "PUT"
        });

        if (!response.ok) {
            const errorMessage = await getErrorMessage(response);
            throw new Error(errorMessage);
        }

        showMessage(appointmentsMessage, "Turno cancelado correctamente", "success");

        if (editingAppointmentId === id) {
            resetAppointmentFormMode();
        }

        await loadAppointments();

    } catch (error) {
        showMessage(appointmentsMessage, error.message, "error");
    }
}

function renderEmptyAppointments() {
    const item = document.createElement("li");
    item.classList.add("empty-appointments");

    item.innerHTML = `
        <div class="empty-icon">🗓️</div>
        <strong>No hay turnos para mostrar</strong>
        <span>Cuando reserves un turno, aparecerá en esta sección.</span>
    `;

    appointmentsList.appendChild(item);
}

async function getErrorMessage(response) {
    try {
        const errorData = await response.json();

        if (errorData.message) {
            return errorData.message;
        }

        if (errorData.error) {
            return errorData.error;
        }

        return "No se pudo procesar la operación";

    } catch (error) {
        return "No se pudo procesar la operación";
    }
}

function showMessage(element, message, type) {
    element.textContent = message;
    element.className = `form-message ${type}`;
}

function getStatusLabel(status) {
    if (status === "ACTIVE") {
        return "Activo";
    }

    if (status === "CANCELLED") {
        return "Cancelado";
    }

    if (status === "FINISHED") {
        return "Finalizado";
    }

    return status;
}

function getStatusClass(status) {
    if (status === "ACTIVE") {
        return "active";
    }

    if (status === "CANCELLED") {
        return "cancelled";
    }

    if (status === "FINISHED") {
        return "finished";
    }

    return "";
}

function formatDate(date) {
    if (!date) {
        return "-";
    }

    const parts = date.split("-");

    if (parts.length !== 3) {
        return date;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

function formatTime(time) {
    if (!time) {
        return "-";
    }

    return time.substring(0, 5);
}

