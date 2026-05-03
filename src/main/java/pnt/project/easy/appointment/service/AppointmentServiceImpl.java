package pnt.project.easy.appointment.service;

import java.time.LocalDate;
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

        validateDateIsNotPast(request.getDate());

        User client = findClientById(request.getClientId());
        Professional professional = findProfessionalById(request.getProfessionalId());
        OfferedService offeredService = findOfferedServiceById(request.getServiceId());

        validateProfessionalAvailability(
                professional,
                request.getDate(),
                request.getTime()
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
                    "Only active appointments can be updated"
            );
        }

        validateDateIsNotPast(request.getDate());

        Professional professional = findProfessionalById(request.getProfessionalId());
        OfferedService offeredService = findOfferedServiceById(request.getServiceId());

        boolean appointmentExists = appointmentRepository.existsByProfessionalAndDateAndTimeAndStatusAndIdNot(
                professional,
                request.getDate(),
                request.getTime(),
                AppointmentStatus.ACTIVE,
                id
        );

        if (appointmentExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Professional already has an active appointment at this date and time"
            );
        }

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
                    "Appointment is already cancelled"
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
                        "Appointment not found"
                ));
    }

    private Professional findProfessionalById(Long professionalId) {
        return professionalRepository.findById(professionalId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Professional not found"
                ));
    }

    private OfferedService findOfferedServiceById(Long serviceId) {
        return offeredServiceRepository.findById(serviceId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Service not found"
                ));
    }

    private User findClientById(Long clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Client not found"
                ));

        if (client.getRole() != UserRole.CLIENT) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "User must have CLIENT role to create an appointment"
            );
        }

        return client;
    }

    private void validateDateIsNotPast(LocalDate date) {
        if (date.isBefore(LocalDate.now())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Appointment date cannot be in the past"
            );
        }
    }

    private void validateProfessionalAvailability(Professional professional,
                                                  LocalDate date,
                                                  java.time.LocalTime time) {

        boolean appointmentExists = appointmentRepository.existsByProfessionalAndDateAndTimeAndStatus(
                professional,
                date,
                time,
                AppointmentStatus.ACTIVE
        );

        if (appointmentExists) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Professional already has an active appointment at this date and time"
            );
        }
    }
}