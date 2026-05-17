let allAppointments = [];

document.addEventListener("DOMContentLoaded", function () {
    const loggedUser = JSON.parse(localStorage.getItem("loggedUser"));

    if (!loggedUser) {
        window.location.href = "index.html";
        return;
    }

    if (loggedUser.role !== "ADMIN") {
        window.location.href = "home.html";
        return;
    }

    const welcomeMessage = document.getElementById("welcomeMessage");
    const logoutButton = document.getElementById("logoutButton");

    const serviceForm = document.getElementById("serviceForm");
    const professionalForm = document.getElementById("professionalForm");
    const appointmentStatusFilter = document.getElementById("appointmentStatusFilter");
    welcomeMessage.textContent = `Bienvenido, ${loggedUser.name}`;

    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("loggedUser");
        window.location.href = "index.html";
    });

    serviceForm.addEventListener("submit", createService);
    professionalForm.addEventListener("submit", createProfessional);
    appointmentStatusFilter.addEventListener("change", renderFilteredAppointments);

    loadServices();
    loadProfessionals();
    loadAllAppointments();
    setupAdminSections();
});

async function loadServices(showLoading = true) {
    const servicesList = document.getElementById("servicesList");
    const servicesMessage = document.getElementById("servicesMessage");

    if (showLoading) {
        showMessage(servicesMessage, "Cargando servicios...", "info");
    }

    servicesList.innerHTML = "";

    try {
        const response = await fetch("/api/offered-services");

        if (!response.ok) {
            throw new Error("No se pudieron cargar los servicios");
        }

        const services = await response.json();
        updateCounter("servicesCounter", services.length);

        renderServices(services);

        if (showLoading) {
            clearMessage(servicesMessage);
        }

    } catch (error) {
        showMessage(servicesMessage, error.message, "error");
    }
}

function renderServices(services) {
    const servicesList = document.getElementById("servicesList");

    servicesList.innerHTML = "";

    if (services.length === 0) {
        servicesList.innerHTML = "<li>No hay servicios cargados</li>";
        return;
    }

    services.forEach(function (service) {
        const li = document.createElement("li");

        const serviceText = document.createElement("span");
        serviceText.textContent = `${service.name} - ${service.durationMinutes} min - $${service.price}`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️";
        deleteButton.classList.add("icon-action-button", "danger-icon-button");
        deleteButton.setAttribute("data-tooltip", "Eliminar");
        deleteButton.setAttribute("aria-label", "Eliminar");
        deleteButton.title = "Eliminar";

        deleteButton.addEventListener("click", function () {
            deleteService(service.id);
        });

        li.appendChild(serviceText);
        li.appendChild(deleteButton);

        servicesList.appendChild(li);
    });
}

async function createService(event) {
    event.preventDefault();

    const nameInput = document.getElementById("serviceName");
    const durationInput = document.getElementById("serviceDuration");
    const priceInput = document.getElementById("servicePrice");
    const servicesMessage = document.getElementById("servicesMessage");

    clearMessage(servicesMessage);

    if (nameInput.value.trim() === "") {
        showMessage(servicesMessage, "Debe ingresar el nombre del servicio", "error");
        nameInput.focus();
        return;
    }

    if (durationInput.value === "") {
        showMessage(servicesMessage, "Debe ingresar la duración del servicio", "error");
        durationInput.focus();
        return;
    }

    if (Number(durationInput.value) <= 0) {
        showMessage(servicesMessage, "La duración debe ser mayor a cero", "error");
        durationInput.focus();
        return;
    }

    if (priceInput.value === "") {
        showMessage(servicesMessage, "Debe ingresar el precio del servicio", "error");
        priceInput.focus();
        return;
    }

    if (Number(priceInput.value) <= 0) {
        showMessage(servicesMessage, "El precio debe ser mayor a cero", "error");
        priceInput.focus();
        return;
    }

    const offeredService = {
        name: nameInput.value.trim(),
        durationMinutes: Number(durationInput.value),
        price: Number(priceInput.value)
    };

    try {
        const response = await fetch("/api/offered-services", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(offeredService)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "No se pudo crear el servicio");
        }

        nameInput.value = "";
        durationInput.value = "";
        priceInput.value = "";

        await loadServices(false);

        showMessage(servicesMessage, "Servicio creado correctamente", "success");

    } catch (error) {
        showMessage(servicesMessage, error.message, "error");
    }
}

async function deleteService(id) {
    const servicesMessage = document.getElementById("servicesMessage");

    const confirmed = confirm("¿Seguro que querés eliminar este servicio?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/offered-services/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            let errorMessage = "No se pudo eliminar el servicio";

            try {
                const data = await response.json();
                errorMessage = data.message || errorMessage;
            } catch (error) {
                // Si el backend no devuelve JSON, dejamos el mensaje genérico.
            }

            throw new Error(errorMessage);
        }

        await loadServices(false);

        showMessage(servicesMessage, "Servicio eliminado correctamente", "success");

    } catch (error) {
        showMessage(servicesMessage, error.message, "error");
    }
}

async function loadProfessionals(showLoading = true) {
    const professionalsList = document.getElementById("professionalsList");
    const professionalsMessage = document.getElementById("professionalsMessage");

    if (showLoading) {
        showMessage(professionalsMessage, "Cargando profesionales...", "info");
    }

    professionalsList.innerHTML = "";

    try {
        const response = await fetch("/api/professionals");

        if (!response.ok) {
            throw new Error("No se pudieron cargar los profesionales");
        }

        const professionals = await response.json();
        updateCounter("professionalsCounter", professionals.length);

        renderProfessionals(professionals);

        if (showLoading) {
            clearMessage(professionalsMessage);
        }

    } catch (error) {
        showMessage(professionalsMessage, error.message, "error");
    }
}

function renderProfessionals(professionals) {
    const professionalsList = document.getElementById("professionalsList");

    professionalsList.innerHTML = "";

    if (professionals.length === 0) {
        professionalsList.innerHTML = "<li>No hay profesionales cargados</li>";
        return;
    }

    professionals.forEach(function (professional) {
        const li = document.createElement("li");

        const professionalText = document.createElement("span");
        professionalText.textContent = `${professional.firstName} ${professional.lastName}`;

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "🗑️";
        deleteButton.classList.add("icon-action-button", "danger-icon-button");
        deleteButton.setAttribute("data-tooltip", "Eliminar");
        deleteButton.setAttribute("aria-label", "Eliminar");
        deleteButton.title = "Eliminar";

        deleteButton.addEventListener("click", function () {
            deleteProfessional(professional.id);
        });

        li.appendChild(professionalText);
        li.appendChild(deleteButton);

        professionalsList.appendChild(li);
    });
}

async function createProfessional(event) {
    event.preventDefault();

    const firstNameInput = document.getElementById("professionalFirstName");
    const lastNameInput = document.getElementById("professionalLastName");
    const professionalsMessage = document.getElementById("professionalsMessage");

    clearMessage(professionalsMessage);

    if (firstNameInput.value.trim() === "") {
        showMessage(professionalsMessage, "Debe ingresar el nombre del profesional", "error");
        firstNameInput.focus();
        return;
    }

    if (lastNameInput.value.trim() === "") {
        showMessage(professionalsMessage, "Debe ingresar el apellido del profesional", "error");
        lastNameInput.focus();
        return;
    }

    const professional = {
        firstName: firstNameInput.value.trim(),
        lastName: lastNameInput.value.trim()
    };

    try {
        const response = await fetch("/api/professionals", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(professional)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "No se pudo crear el profesional");
        }

        firstNameInput.value = "";
        lastNameInput.value = "";

        await loadProfessionals(false);

        showMessage(professionalsMessage, "Profesional creado correctamente", "success");

    } catch (error) {
        showMessage(professionalsMessage, error.message, "error");
    }
}

async function deleteProfessional(id) {
    const professionalsMessage = document.getElementById("professionalsMessage");

    const confirmed = confirm("¿Seguro que querés eliminar este profesional?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/professionals/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            let errorMessage = "No se pudo eliminar el profesional";

            try {
                const data = await response.json();
                errorMessage = data.message || errorMessage;
            } catch (error) {
                // Si el backend no devuelve JSON, dejamos el mensaje genérico.
            }

            throw new Error(errorMessage);
        }

        await loadProfessionals(false);

        showMessage(professionalsMessage, "Profesional eliminado correctamente", "success");

    } catch (error) {
        showMessage(professionalsMessage, error.message, "error");
    }
}

async function loadAllAppointments(showLoading = true) {
    const appointmentsMessage = document.getElementById("appointmentsMessage");
    const appointmentsTableBody = document.getElementById("appointmentsTableBody");

    if (showLoading) {
        showMessage(appointmentsMessage, "Cargando turnos...", "info");
    }

    appointmentsTableBody.innerHTML = "";

    try {
        const response = await fetch("/api/appointments");

        if (!response.ok) {
            throw new Error("No se pudieron cargar los turnos");
        }

        const appointments = await response.json();

        allAppointments = appointments;

        updateAppointmentCounters(allAppointments);
        renderFilteredAppointments();

        if (showLoading) {
            clearMessage(appointmentsMessage);
        }

    } catch (error) {
        showMessage(appointmentsMessage, error.message, "error");
    }
}

function renderAllAppointments(appointments) {
    const appointmentsTableBody = document.getElementById("appointmentsTableBody");

    appointmentsTableBody.innerHTML = "";

    if (appointments.length === 0) {
        appointmentsTableBody.innerHTML = `
            <tr>
                <td colspan="7">No hay turnos cargados</td>
            </tr>
        `;
        return;
    }

    appointments.forEach(function (appointment) {
        const row = document.createElement("tr");

        const clientName = appointment.client
            ? appointment.client.name
            : "Sin cliente";

        const serviceName = appointment.offeredService
            ? appointment.offeredService.name
            : "Sin servicio";

        const professionalName = appointment.professional
            ? `${appointment.professional.firstName} ${appointment.professional.lastName}`
            : "Sin profesional";

        row.innerHTML = `
            <td>${formatDate(appointment.date)}</td>
            <td>${formatTime(appointment.time)}</td>
            <td>${clientName}</td>
            <td>${serviceName}</td>
            <td>${professionalName}</td>
            <td><span class="status ${appointment.status.toLowerCase()}">${getStatusLabel(appointment.status)}</span></td>
            <td></td>
        `;

        const actionCell = row.children[6];

        if (appointment.status === "ACTIVE") {
            const cancelButton = document.createElement("button");
            cancelButton.textContent = "Cancelar";

            cancelButton.addEventListener("click", function () {
                cancelAppointmentAsAdmin(appointment.id);
            });

            actionCell.appendChild(cancelButton);
        } else {
            actionCell.textContent = "-";
        }

        appointmentsTableBody.appendChild(row);
    });
}

async function cancelAppointmentAsAdmin(id) {
    const appointmentsMessage = document.getElementById("appointmentsMessage");

    const confirmed = confirm("¿Seguro que querés cancelar este turno?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(`/api/appointments/${id}/cancel`, {
            method: "PUT"
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "No se pudo cancelar el turno");
        }

        await loadAllAppointments(false);

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

function renderFilteredAppointments() {
    const appointmentStatusFilter = document.getElementById("appointmentStatusFilter");

    let filteredAppointments = allAppointments;

    if (appointmentStatusFilter.value !== "ALL") {
        filteredAppointments = allAppointments.filter(function (appointment) {
            return appointment.status === appointmentStatusFilter.value;
        });
    }

    renderAllAppointments(filteredAppointments);
}

function updateAppointmentCounters(appointments) {
    const activeAppointments = appointments.filter(function (appointment) {
        return appointment.status === "ACTIVE";
    });

    const cancelledAppointments = appointments.filter(function (appointment) {
        return appointment.status === "CANCELLED";
    });

    updateCounter("activeAppointmentsCounter", activeAppointments.length);
    updateCounter("cancelledAppointmentsCounter", cancelledAppointments.length);
}

function updateCounter(elementId, value) {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = value;
    }
}

function setupAdminSections() {
    const sectionTabs = document.querySelectorAll(".admin-section-tab");
    const sectionPanels = document.querySelectorAll(".admin-section-panel");

    sectionTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            const targetId = tab.getAttribute("data-target");

            sectionTabs.forEach(function (currentTab) {
                currentTab.classList.remove("active");
            });

            sectionPanels.forEach(function (panel) {
                panel.classList.remove("active");
            });

            tab.classList.add("active");

            const targetPanel = document.getElementById(targetId);

            if (targetPanel) {
                targetPanel.classList.add("active");
            }
        });
    });
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

