package pnt.project.easy.appointment.service;

import java.time.LocalDate;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pnt.project.easy.appointment.body.AppointmentCreateRequest;
import pnt.project.easy.appointment.body.AppointmentUpdateRequest;
import pnt.project.easy.appointment.model.Appointment;
import pnt.project.easy.appointment.model.Professional;
import pnt.project.easy.appointment.model.enums.AppointmentStatus;
import pnt.project.easy.appointment.repository.AppointmentRepository;
import pnt.project.easy.appointment.repository.ProfessionalRepository;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final ProfessionalRepository professionalRepository;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository,
                                  ProfessionalRepository professionalRepository) {
        this.appointmentRepository = appointmentRepository;
        this.professionalRepository = professionalRepository;
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

        Professional professional = findProfessionalById(request.getProfessionalId());

        validateProfessionalAvailability(
                professional,
                request.getDate(),
                request.getTime()
        );

        Appointment appointment = new Appointment();
        appointment.setClientName(request.getClientName());
        appointment.setDate(request.getDate());
        appointment.setTime(request.getTime());
        appointment.setStatus(AppointmentStatus.ACTIVE);
        appointment.setProfessional(professional);

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

        appointment.setClientName(request.getClientName());
        appointment.setDate(request.getDate());
        appointment.setTime(request.getTime());
        appointment.setProfessional(professional);

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