package pnt.project.easy.appointment.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pnt.project.easy.appointment.body.AppointmentCreateRequest;
import pnt.project.easy.appointment.body.AppointmentUpdateRequest;
import pnt.project.easy.appointment.model.Appointment;
import pnt.project.easy.appointment.model.OfferedService;
import pnt.project.easy.appointment.model.Professional;
import pnt.project.easy.appointment.model.User;
import pnt.project.easy.appointment.model.enums.AppointmentStatus;
import pnt.project.easy.appointment.model.enums.UserRole;
import pnt.project.easy.appointment.repository.AppointmentRepository;
import pnt.project.easy.appointment.repository.OfferedServiceRepository;
import pnt.project.easy.appointment.repository.ProfessionalRepository;
import pnt.project.easy.appointment.repository.UserRepository;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ProfessionalRepository professionalRepository;
    private final UserRepository userRepository;
    private final OfferedServiceRepository offeredServiceRepository;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
                                  ProfessionalRepository professionalRepository,
                                  UserRepository userRepository,
                                  OfferedServiceRepository offeredServiceRepository) {
        this.appointmentRepository = appointmentRepository;
        this.professionalRepository = professionalRepository;
        this.userRepository = userRepository;
        this.offeredServiceRepository = offeredServiceRepository;
    }

    @Override
    public List<Appointment> getAll() {
        return appointmentRepository.findAll();
    }

    @Override
    public Appointment getById(Long id) {
        return findAppointmentById(id);
    }

    @Override
    public Appointment create(AppointmentCreateRequest request) {

        validateDateAndTimeAreNotPast(request.getDate(), request.getTime());

        User client = findClientById(request.getClientId());
        Professional professional = findProfessionalById(request.getProfessionalId());
        OfferedService offeredService = findOfferedServiceById(request.getServiceId());

        validateProfessionalAvailability(
                professional,
                request.getDate(),
                request.getTime(),
                offeredService
        );

        Appointment appointment = new Appointment();
        appointment.setClient(client);
        appointment.setProfessional(professional);
        appointment.setOfferedService(offeredService);
        appointment.setDate(request.getDate());
        appointment.setTime(request.getTime());
        appointment.setStatus(AppointmentStatus.ACTIVE);

        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment update(Long id, AppointmentUpdateRequest request) {

        Appointment appointment = findAppointmentById(id);

        if (appointment.getStatus() != AppointmentStatus.ACTIVE) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Solo se pueden modificar turnos activos"
            );
        }

        validateDateAndTimeAreNotPast(request.getDate(), request.getTime());

        Professional professional = findProfessionalById(request.getProfessionalId());
        OfferedService offeredService = findOfferedServiceById(request.getServiceId());

        validateProfessionalAvailabilityForUpdate(
                professional,
                request.getDate(),
                request.getTime(),
                offeredService,
                id
        );

        appointment.setDate(request.getDate());
        appointment.setTime(request.getTime());
        appointment.setProfessional(professional);
        appointment.setOfferedService(offeredService);

        return appointmentRepository.save(appointment);
    }

    @Override
    public Appointment cancel(Long id) {

        Appointment appointment = findAppointmentById(id);

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "El turno ya se encuentra cancelado"
            );
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);

        return appointmentRepository.save(appointment);
    }

    @Override
    public void delete(Long id) {

        Appointment appointment = findAppointmentById(id);

        appointmentRepository.delete(appointment);
    }

    private Appointment findAppointmentById(Long id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Turno no encontrado"
                ));
    }

    private Professional findProfessionalById(Long professionalId) {
        return professionalRepository.findById(professionalId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Profesional no encontrado"
                ));
    }

    private OfferedService findOfferedServiceById(Long serviceId) {
        return offeredServiceRepository.findById(serviceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Servicio no encontrado"
                ));
    }

    private User findClientById(Long clientId) {

        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Cliente no encontrado"
                ));

        if (client.getRole() != UserRole.CLIENT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "El usuario debe tener rol CLIENTE para crear un turno"
            );
        }

        return client;
    }

    private void validateDateAndTimeAreNotPast(LocalDate date, LocalTime time) {

        if (date.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La fecha del turno no puede estar en el pasado"
            );
        }

        LocalTime currentTime = LocalTime.now().withSecond(0).withNano(0);

        if (date.isEqual(LocalDate.now()) && time.isBefore(currentTime)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La hora del turno no puede estar en el pasado"
            );
        }
    }

    private void validateProfessionalAvailability(Professional professional,
                                                  LocalDate date,
                                                  LocalTime startTime,
                                                  OfferedService newService) {

        List<Appointment> activeAppointments = appointmentRepository.findByProfessionalAndDateAndStatus(
                professional,
                date,
                AppointmentStatus.ACTIVE
        );

        validateTimeOverlap(activeAppointments, startTime, newService);
    }

    private void validateProfessionalAvailabilityForUpdate(Professional professional,
                                                           LocalDate date,
                                                           LocalTime startTime,
                                                           OfferedService newService,
                                                           Long appointmentId) {

        List<Appointment> activeAppointments = appointmentRepository.findByProfessionalAndDateAndStatusAndIdNot(
                professional,
                date,
                AppointmentStatus.ACTIVE,
                appointmentId
        );

        validateTimeOverlap(activeAppointments, startTime, newService);
    }

    private void validateTimeOverlap(List<Appointment> activeAppointments,
                                     LocalTime newStartTime,
                                     OfferedService newService) {

        LocalTime newEndTime = newStartTime.plusMinutes(newService.getDurationMinutes());

        for (Appointment existingAppointment : activeAppointments) {

            LocalTime existingStartTime = existingAppointment.getTime();

            LocalTime existingEndTime = existingStartTime.plusMinutes(
                    existingAppointment.getOfferedService().getDurationMinutes()
            );

            boolean overlaps = newStartTime.isBefore(existingEndTime)
                    && newEndTime.isAfter(existingStartTime);

            if (overlaps) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "El profesional ya tiene un turno activo en ese rango horario"
                );
            }
        }
    }
}