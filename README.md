# Easy Appointment

**Easy Appointment** es un sistema web de gestión de turnos desarrollado como proyecto académico.

Permite que los clientes se registren, inicien sesión, reserven turnos, consulten sus turnos, los cancelen y los reprogramen. Además, cuenta con un panel administrador para gestionar servicios, profesionales y visualizar la agenda general del sistema con filtros avanzados.

---

## Tecnologías utilizadas

### Backend

* Java 21
* Spring Boot
* Spring Web
* Spring Data JPA
* Hibernate
* Jakarta Validation
* MySQL
* Maven

### Frontend

* HTML
* CSS
* JavaScript
* Fetch API
* LocalStorage

---

## Arquitectura general

El proyecto está desarrollado como una aplicación monolítica con backend y frontend dentro del mismo proyecto Spring Boot.

El backend expone una API REST y el frontend consume esos endpoints mediante `fetch()`.

La información se guarda en una base de datos MySQL utilizando JPA e Hibernate.

El proyecto está organizado por capas, separando responsabilidades entre controladores, servicios, repositorios, entidades, DTOs y manejo de errores.

---

## Estructura del proyecto

```txt
src/main/java/pnt/project/easy/appointment

├── body
│   ├── AuthResponse
│   ├── LoginRequest
│   ├── RegisterRequest
│   ├── AppointmentCreateRequest
│   └── AppointmentUpdateRequest

├── controller
│   ├── AuthController
│   ├── AppointmentController
│   ├── ProfessionalController
│   └── OfferedServiceController

├── exception
│   ├── ApiError
│   └── GlobalExceptionHandler

├── model
│   ├── User
│   ├── Appointment
│   ├── Professional
│   └── OfferedService

├── model.enums
│   ├── UserRole
│   └── AppointmentStatus

├── repository
│   ├── UserRepository
│   ├── AppointmentRepository
│   ├── ProfessionalRepository
│   └── OfferedServiceRepository

└── service
    ├── AuthService
    ├── AuthServiceImpl
    ├── AppointmentService
    ├── AppointmentServiceImpl
    ├── ProfessionalService
    ├── ProfessionalServiceImpl
    ├── OfferedServiceService
    └── OfferedServiceServiceImpl
```

```txt
src/main/resources/static

├── index.html
├── register.html
├── home.html
├── admin.html
├── auth.js
├── register.js
├── client.js
├── admin.js
└── styles.css
```

---

## Roles del sistema

El sistema utiliza dos roles principales.

### CLIENT

Usuario cliente del sistema.

Puede:

* registrarse;
* iniciar sesión;
* reservar turnos;
* ver sus turnos;
* filtrar sus turnos por estado;
* reprogramar turnos activos;
* cancelar turnos activos.

### ADMIN

Usuario administrador del sistema.

Puede:

* iniciar sesión;
* crear servicios;
* listar servicios;
* eliminar servicios sin turnos asociados;
* crear profesionales;
* listar profesionales;
* dar de baja profesionales sin turnos activos;
* visualizar la agenda general;
* filtrar turnos por estado, profesional, servicio, fecha y cliente;
* cancelar turnos activos;
* ver contadores generales del sistema.

---

## Funcionalidades principales

### Registro de clientes

El cliente puede crear una cuenta ingresando nombre completo, email, contraseña y confirmación de contraseña.

Validaciones aplicadas:

* el nombre completo debe incluir nombre y apellido;
* el email debe tener formato válido;
* las contraseñas deben coincidir;
* el rol se asigna automáticamente como `CLIENT`.

El usuario no puede elegir su rol desde el frontend.

---

### Inicio de sesión

El sistema permite iniciar sesión con email y contraseña.

Según el rol del usuario:

* si es `CLIENT`, se redirige a `home.html`;
* si es `ADMIN`, se redirige a `admin.html`.

El frontend utiliza `localStorage` para guardar temporalmente los datos básicos del usuario autenticado bajo la clave `loggedUser`.

---

### Reserva de turnos

El cliente puede reservar un turno seleccionando servicio, profesional, fecha y hora.

Cada servicio tiene una duración en minutos. Esa duración se utiliza para validar la disponibilidad real del profesional.

Validaciones aplicadas:

* todos los campos son obligatorios;
* no se pueden reservar turnos en fechas pasadas;
* si la fecha es el día actual, no se puede reservar en una hora pasada;
* un profesional no puede tener turnos activos superpuestos en el mismo rango horario;
* la validación de disponibilidad se realiza en backend usando la duración real del servicio.

Ejemplo:

```txt
Turno existente:
10:00 a 10:45

Nuevo turno:
10:30 a 11:00

Resultado:
No se permite porque los rangos horarios se superponen.
```

---

### Reprogramación de turnos

El cliente puede reprogramar turnos activos.

Al seleccionar la opción **Reprogramar**, el formulario de reserva se carga con los datos actuales del turno. Luego, al guardar los cambios, el frontend realiza una petición `PUT` al backend.

Validaciones aplicadas:

* solo se pueden reprogramar turnos activos;
* no se puede reprogramar a una fecha pasada;
* si la fecha es el día actual, no se puede reprogramar a una hora pasada;
* no se puede reprogramar a un horario que se superponga con otro turno activo del mismo profesional.

---

### Mis turnos

El cliente puede visualizar sus turnos en formato de tarjetas.

Cada tarjeta muestra:

* servicio;
* profesional;
* fecha;
* hora;
* estado.

Los turnos pueden filtrarse por:

* todos;
* activos;
* cancelados.

Los turnos activos pueden ser:

* reprogramados;
* cancelados.

---

### Panel administrador

El administrador cuenta con un panel dividido en tres secciones:

* Gestión de servicios;
* Gestión de profesionales;
* Agenda general.

También se muestran contadores de:

* cantidad de servicios;
* cantidad de profesionales;
* turnos activos;
* turnos cancelados.

---

### Gestión de servicios

El administrador puede crear, listar y eliminar servicios.

Cada servicio tiene:

* nombre;
* duración en minutos;
* precio.

Validaciones aplicadas:

* el nombre no puede estar vacío;
* la duración debe ser mayor a cero;
* el precio debe ser mayor a cero;
* no se permiten servicios repetidos;
* no se puede eliminar un servicio que tiene turnos asociados.

---

### Gestión de profesionales

El administrador puede crear, listar y dar de baja profesionales.

Cada profesional tiene:

* nombre;
* apellido;
* estado activo/inactivo.

Validaciones aplicadas:

* el nombre no puede estar vacío;
* el apellido no puede estar vacío;
* no se permiten profesionales repetidos;
* no se puede dar de baja un profesional que tiene turnos activos asignados.

La baja de profesionales es lógica. Esto significa que el profesional no se elimina físicamente de la base de datos, sino que se marca como inactivo.

---

### Agenda general

El administrador puede ver todos los turnos registrados en el sistema.

La agenda muestra:

* fecha;
* hora;
* cliente;
* servicio;
* profesional;
* estado;
* acción disponible.

Los turnos pueden filtrarse por:

* estado;
* profesional;
* servicio;
* fecha;
* nombre del cliente.

Los turnos activos pueden ser cancelados desde el panel administrador.

---

## Validación de superposición horaria

Una de las reglas principales del sistema es evitar que un profesional tenga turnos activos superpuestos.

Para esto, el backend:

1. Recupera el servicio seleccionado.
2. Obtiene su duración en minutos.
3. Calcula la hora de finalización del nuevo turno.
4. Busca los turnos activos del mismo profesional en la misma fecha.
5. Compara los rangos horarios.

La condición utilizada es:

```txt
nuevoInicio < existenteFin && nuevoFin > existenteInicio
```

Si esa condición se cumple, significa que los turnos se pisan y la operación se bloquea.

Esto aplica tanto para:

* creación de turnos;
* reprogramación de turnos.

---

## Endpoints principales

### Autenticación

```txt
POST /api/auth/register
POST /api/auth/login
```

### Turnos

```txt
GET    /api/appointments
GET    /api/appointments/{id}
POST   /api/appointments
PUT    /api/appointments/{id}
PUT    /api/appointments/{id}/cancel
DELETE /api/appointments/{id}
```

### Profesionales

```txt
GET    /api/professionals
POST   /api/professionals
DELETE /api/professionals/{id}
```

### Servicios

```txt
GET    /api/offered-services
POST   /api/offered-services
DELETE /api/offered-services/{id}
```

---

## Base de datos

El proyecto utiliza MySQL.

La base de datos esperada es:

```sql
CREATE DATABASE easy_appointment_db;
```

La configuración de conexión se encuentra en:

```txt
src/main/resources/application.yaml
```

Ejemplo:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/easy_appointment_db
    username: root
    password: tu_password

  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
```

Para este proyecto académico se utilizó `ddl-auto: update` para permitir que Hibernate actualice la estructura de tablas durante el desarrollo.

En un entorno productivo, sería recomendable utilizar migraciones controladas con herramientas como Flyway o Liquibase.

---

## Cómo ejecutar el proyecto

1. Clonar el repositorio:

```bash
git clone https://github.com/LautaroGijon/easy-appointment.git
```

2. Entrar a la carpeta del proyecto:

```bash
cd easy-appointment
```

3. Crear la base de datos en MySQL:

```sql
CREATE DATABASE easy_appointment_db;
```

4. Configurar usuario y contraseña de MySQL en `application.yaml`.

5. Ejecutar la aplicación desde Eclipse o mediante Maven:

```bash
./mvnw spring-boot:run
```

En Windows:

```bat
mvnw spring-boot:run
```

6. Abrir el navegador en:

```txt
http://localhost:8080/index.html
```

---

## Flujo de uso

### Cliente

1. Registrarse desde `register.html`.
2. Iniciar sesión desde `index.html`.
3. Reservar un turno desde `home.html`.
4. Consultar sus turnos.
5. Filtrar turnos por estado.
6. Reprogramar turnos activos.
7. Cancelar turnos activos.

### Administrador

1. Iniciar sesión como usuario administrador.
2. Gestionar servicios.
3. Gestionar profesionales.
4. Visualizar agenda general.
5. Filtrar turnos por estado, profesional, servicio, fecha y cliente.
6. Cancelar turnos activos.

---

## Validaciones importantes

El sistema valida reglas tanto en frontend como en backend.

El frontend mejora la experiencia de usuario mostrando mensajes antes de enviar solicitudes incorrectas.

El backend mantiene la consistencia de la información, evitando que se creen datos inválidos desde herramientas externas como Postman.

Ejemplos de validaciones backend:

* no crear turnos en fechas pasadas;
* no crear turnos en una hora pasada si la fecha es hoy;
* no crear turnos superpuestos para el mismo profesional;
* no reprogramar turnos cancelados;
* no reprogramar turnos a horarios superpuestos;
* no eliminar servicios con turnos asociados;
* no dar de baja profesionales con turnos activos;
* no registrar clientes sin nombre y apellido;
* no registrar emails duplicados;
* no registrar profesionales duplicados;
* no registrar servicios duplicados.

---

## Manejo de errores

El proyecto cuenta con manejo de errores mediante excepciones y respuestas JSON.

Por ejemplo:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Turno no encontrado"
}
```

Esto permite que el frontend reciba mensajes claros y pueda mostrarlos al usuario.

---

## Enfoque POO

Aunque el proyecto utiliza entidades JPA con getters y setters para mantener compatibilidad con Hibernate y Jackson, se incorporaron métodos de negocio en entidades clave.

Ejemplos:

```java
appointment.cancel();
professional.deactivate();
```

Esto permite expresar mejor acciones del dominio y evita que la lógica de negocio dependa únicamente de setters genéricos como `setStatus()` o `setActive()`.

---

## Aclaraciones de seguridad

Este proyecto fue desarrollado con fines académicos.

Actualmente la autenticación es simple y utiliza comparación directa de contraseñas.

En un entorno real o productivo deberían implementarse mejoras como:

* Spring Security;
* contraseñas encriptadas con BCrypt;
* JWT o sesiones seguras;
* autorización real del lado backend;
* protección de rutas;
* variables de entorno para credenciales;
* validaciones más estrictas de permisos.

---

## Mejoras futuras

Algunas posibles mejoras futuras del sistema son:

* implementar Spring Security;
* encriptar contraseñas;
* agregar recuperación de contraseña;
* permitir edición de servicios y profesionales;
* agregar especialidades profesionales;
* permitir que cada profesional visualice su propia agenda;
* agregar estados adicionales como finalizado o ausente;
* enviar confirmaciones por email;
* agregar paginación en la agenda general;
* agregar tests unitarios e integración;
* crear perfiles de configuración para desarrollo y producción;
* utilizar migraciones con Flyway o Liquibase.

---

## Estado del proyecto

El proyecto cuenta con:

* backend funcional;
* API REST;
* conexión a MySQL;
* frontend integrado;
* registro e inicio de sesión;
* roles cliente y administrador;
* gestión de servicios;
* gestión de profesionales;
* reserva, reprogramación y cancelación de turnos;
* validación de superposición horaria por duración del servicio;
* dashboard administrador;
* filtros avanzados en agenda general;
* validaciones frontend y backend;
* manejo de errores centralizado;
* diseño visual responsive.

---

## Autor

Proyecto desarrollado por **Lautaro Gijón** como sistema de gestión de turnos para una aplicación web monolítica con Spring Boot, MySQL, HTML, CSS y JavaScript.
