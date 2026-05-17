# Easy Appointment

**Easy Appointment** es un sistema web de gestión de turnos desarrollado como proyecto académico.

Permite que los clientes se registren, inicien sesión, reserven turnos, consulten sus turnos y los cancelen. Además, cuenta con un panel administrador para gestionar servicios, profesionales y visualizar la agenda general del sistema.

---

## Tecnologías utilizadas

### Backend

- Java 21
- Spring Boot
- Spring Web
- Spring Data JPA
- Hibernate
- Jakarta Validation
- MySQL
- Maven

### Frontend

- HTML
- CSS
- JavaScript
- Fetch API
- LocalStorage

---

## Arquitectura general

El proyecto está desarrollado como una aplicación monolítica con backend y frontend dentro del mismo proyecto Spring Boot.

El backend expone una API REST y el frontend consume esos endpoints mediante `fetch()`.

La información se guarda en una base de datos MySQL utilizando JPA e Hibernate.

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
    ├── OfferedService
    └── OfferedServiceImpl
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

El sistema utiliza dos roles principales:

### CLIENT

Usuario cliente del sistema.

Puede:

- registrarse;
- iniciar sesión;
- reservar turnos;
- ver sus turnos;
- filtrar sus turnos por estado;
- cancelar turnos activos.

### ADMIN

Usuario administrador del sistema.

Puede:

- iniciar sesión;
- crear servicios;
- listar servicios;
- eliminar servicios sin turnos asociados;
- crear profesionales;
- listar profesionales;
- eliminar profesionales sin turnos asociados;
- visualizar la agenda general;
- filtrar turnos por estado;
- cancelar turnos activos;
- ver contadores generales del sistema.

---

## Funcionalidades principales

### Registro de clientes

El cliente puede crear una cuenta ingresando nombre completo, email, contraseña y confirmación de contraseña.

Validaciones aplicadas:

- el nombre completo debe incluir nombre y apellido;
- el email debe tener formato válido;
- las contraseñas deben coincidir;
- el rol se asigna automáticamente como `CLIENT`.

El usuario no puede elegir su rol desde el frontend.

---

### Inicio de sesión

El sistema permite iniciar sesión con email y contraseña.

Según el rol del usuario:

- si es `CLIENT`, se redirige a `home.html`;
- si es `ADMIN`, se redirige a `admin.html`.

El frontend utiliza `localStorage` para guardar temporalmente los datos básicos del usuario autenticado.

---

### Reserva de turnos

El cliente puede reservar un turno seleccionando servicio, profesional, fecha y hora.

Validaciones aplicadas:

- todos los campos son obligatorios;
- no se pueden reservar turnos en fechas pasadas;
- si la fecha es el día actual, no se puede reservar en una hora pasada;
- un profesional no puede tener dos turnos activos en la misma fecha y hora.

---

### Mis turnos

El cliente puede visualizar sus turnos en formato de tarjetas.

Cada tarjeta muestra:

- servicio;
- profesional;
- fecha;
- hora;
- estado.

Los turnos pueden filtrarse por:

- todos;
- activos;
- cancelados.

Los turnos activos pueden ser cancelados por el cliente.

---

### Panel administrador

El administrador cuenta con un panel dividido en tres secciones:

- Gestión de servicios;
- Gestión de profesionales;
- Agenda general.

También se muestran contadores de:

- cantidad de servicios;
- cantidad de profesionales;
- turnos activos;
- turnos cancelados.

---

### Gestión de servicios

El administrador puede crear, listar y eliminar servicios.

Cada servicio tiene:

- nombre;
- duración en minutos;
- precio.

Validaciones aplicadas:

- el nombre no puede estar vacío;
- la duración debe ser mayor a cero;
- el precio debe ser mayor a cero;
- no se permiten servicios repetidos;
- no se puede eliminar un servicio que tiene turnos asociados.

---

### Gestión de profesionales

El administrador puede crear, listar y eliminar profesionales.

Cada profesional tiene:

- nombre;
- apellido.

Validaciones aplicadas:

- el nombre no puede estar vacío;
- el apellido no puede estar vacío;
- no se permiten profesionales repetidos;
- no se puede eliminar un profesional que tiene turnos asociados.

---

### Agenda general

El administrador puede ver todos los turnos registrados en el sistema.

La agenda muestra:

- fecha;
- hora;
- cliente;
- servicio;
- profesional;
- estado;
- acción disponible.

Los turnos pueden filtrarse por:

- todos;
- activos;
- cancelados.

Los turnos activos pueden ser cancelados desde el panel administrador.

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
6. Cancelar turnos activos.

### Administrador

1. Iniciar sesión como usuario administrador.
2. Gestionar servicios.
3. Gestionar profesionales.
4. Visualizar agenda general.
5. Filtrar turnos por estado.
6. Cancelar turnos activos.

---

## Validaciones importantes

El sistema valida reglas tanto en frontend como en backend.

El frontend mejora la experiencia de usuario mostrando mensajes antes de enviar solicitudes incorrectas.

El backend mantiene la seguridad y consistencia de la información, evitando que se creen datos inválidos desde herramientas externas como Postman.

Ejemplos de validaciones backend:

- no crear turnos en fechas pasadas;
- no crear turnos en una hora pasada si la fecha es hoy;
- no duplicar turnos activos para el mismo profesional en la misma fecha y hora;
- no eliminar servicios con turnos asociados;
- no eliminar profesionales con turnos asociados;
- no registrar clientes sin nombre y apellido;
- no registrar emails duplicados.

---

## Manejo de errores

El proyecto cuenta con manejo de errores mediante excepciones y respuestas JSON.

Por ejemplo:

```json
{
  "status": 404,
  "error": "Not Found",
  "message": "Professional not found"
}
```

Esto permite que el frontend reciba mensajes claros y pueda mostrarlos al usuario.

---

## Aclaraciones de seguridad

Este proyecto fue desarrollado con fines académicos.

Actualmente la autenticación es simple y utiliza comparación directa de contraseñas.

En un entorno real o productivo deberían implementarse mejoras como:

- Spring Security;
- contraseñas encriptadas con BCrypt;
- JWT o sesiones seguras;
- autorización real del lado backend;
- protección de rutas;
- variables de entorno para credenciales;
- validaciones más estrictas de permisos.

---

## Mejoras futuras

Algunas posibles mejoras futuras del sistema son:

- implementar Spring Security;
- encriptar contraseñas;
- agregar recuperación de contraseña;
- permitir edición de servicios y profesionales;
- agregar especialidades profesionales;
- agregar duración real de turnos según servicio;
- evitar superposición de turnos por rango horario;
- enviar confirmaciones por email;
- agregar paginación en la agenda general;
- agregar tests unitarios e integración;
- crear perfiles de configuración para desarrollo y producción.

---

## Estado del proyecto

El proyecto cuenta con:

- backend funcional;
- API REST;
- conexión a MySQL;
- frontend integrado;
- registro e inicio de sesión;
- roles cliente y administrador;
- gestión de servicios;
- gestión de profesionales;
- reserva y cancelación de turnos;
- dashboard administrador;
- filtros por estado;
- validaciones frontend y backend;
- diseño visual responsive básico.

---

## Autor

Proyecto desarrollado por **Lautaro Gijón** como sistema de gestión de turnos para una aplicación web monolítica con Spring Boot, MySQL, HTML, CSS y JavaScript.
