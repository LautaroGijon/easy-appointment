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
    const btnLoadServices = document.getElementById("btnLoadServices");

    const btnLoadProfessionals = document.getElementById("btnLoadProfessionals");
    const professionalForm = document.getElementById("professionalForm");

    const btnLoadAllAppointments = document.getElementById("btnLoadAllAppointments");

    welcomeMessage.textContent = `Bienvenido, ${loggedUser.name}`;

    logoutButton.addEventListener("click", function () {
        localStorage.removeItem("loggedUser");
        window.location.href = "index.html";
    });

    serviceForm.addEventListener("submit", createService);
    btnLoadServices.addEventListener("click", loadServices);

    btnLoadProfessionals.addEventListener("click", loadProfessionals);
    professionalForm.addEventListener("submit", createProfessional);

    btnLoadAllAppointments.addEventListener("click", loadAllAppointments);

    loadServices();
    loadProfessionals();
    loadAllAppointments();
});

async function loadServices() {
    const servicesList = document.getElementById("servicesList");
    const servicesMessage = document.getElementById("servicesMessage");

    servicesMessage.textContent = "Cargando servicios...";
    servicesList.innerHTML = "";

    try {
        const response = await fetch("/api/offered-services");

        if (!response.ok) {
            throw new Error("No se pudieron cargar los servicios");
        }

        const services = await response.json();

        renderServices(services);

        servicesMessage.textContent = "";

    } catch (error) {
        servicesMessage.textContent = error.message;
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
        deleteButton.textContent = "Eliminar";

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

    servicesMessage.textContent = "";

    const offeredService = {
        name: nameInput.value,
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

        servicesMessage.textContent = "Servicio creado correctamente";

        nameInput.value = "";
        durationInput.value = "";
        priceInput.value = "";

        loadServices();

    } catch (error) {
        servicesMessage.textContent = error.message;
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
            }

            throw new Error(errorMessage);
        }

        servicesMessage.textContent = "Servicio eliminado correctamente";

        loadServices();

    } catch (error) {
        servicesMessage.textContent = error.message;
    }
}

async function loadProfessionals() {
    const professionalsList = document.getElementById("professionalsList");
    const professionalsMessage = document.getElementById("professionalsMessage");

    professionalsMessage.textContent = "Cargando profesionales...";
    professionalsList.innerHTML = "";

    try {
        const response = await fetch("/api/professionals");

        if (!response.ok) {
            throw new Error("No se pudieron cargar los profesionales");
        }

        const professionals = await response.json();

        renderProfessionals(professionals);

        professionalsMessage.textContent = "";

    } catch (error) {
        professionalsMessage.textContent = error.message;
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
        deleteButton.textContent = "Eliminar";

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

    professionalsMessage.textContent = "";

    const professional = {
        firstName: firstNameInput.value,
        lastName: lastNameInput.value
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

        professionalsMessage.textContent = "Profesional creado correctamente";

        firstNameInput.value = "";
        lastNameInput.value = "";

        loadProfessionals();

    } catch (error) {
        professionalsMessage.textContent = error.message;
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
            }

            throw new Error(errorMessage);
        }

        professionalsMessage.textContent = "Profesional eliminado correctamente";

        loadProfessionals();

    } catch (error) {
        professionalsMessage.textContent = error.message;
    }
}

async function loadAllAppointments() {
    const appointmentsMessage = document.getElementById("appointmentsMessage");
    const appointmentsTableBody = document.getElementById("appointmentsTableBody");

    appointmentsMessage.textContent = "Cargando turnos...";
    appointmentsTableBody.innerHTML = "";

    try {
        const response = await fetch("/api/appointments");

        if (!response.ok) {
            throw new Error("No se pudieron cargar los turnos");
        }

        const appointments = await response.json();

        renderAllAppointments(appointments);

        appointmentsMessage.textContent = "";

    } catch (error) {
        appointmentsMessage.textContent = error.message;
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
            <td>${appointment.date}</td>
            <td>${appointment.time}</td>
            <td>${clientName}</td>
            <td>${serviceName}</td>
            <td>${professionalName}</td>
            <td><span class="status ${appointment.status.toLowerCase()}">${appointment.status}</span></td>
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

        appointmentsMessage.textContent = "Turno cancelado correctamente";

        loadAllAppointments();

    } catch (error) {
        appointmentsMessage.textContent = error.message;
    }
}