package pnt.project.easy.appointment.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pnt.project.easy.appointment.model.Appointment;
import pnt.project.easy.appointment.model.OfferedService;
import pnt.project.easy.appointment.model.Professional;
import pnt.project.easy.appointment.model.enums.AppointmentStatus;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    boolean existsByProfessionalAndDateAndTimeAndStatus(
            Professional professional,
            LocalDate date,
            LocalTime time,
            AppointmentStatus status
    );

    boolean existsByProfessionalAndDateAndTimeAndStatusAndIdNot(
            Professional professional,
            LocalDate date,
            LocalTime time,
            AppointmentStatus status,
            Long id
    );

    List<Appointment> findByProfessionalAndDateAndStatus(
            Professional professional,
            LocalDate date,
            AppointmentStatus status
    );

    List<Appointment> findByProfessionalAndDateAndStatusAndIdNot(
            Professional professional,
            LocalDate date,
            AppointmentStatus status,
            Long id
    );

    boolean existsByProfessional(Professional professional);

    boolean existsByProfessionalAndStatus(
            Professional professional,
            AppointmentStatus status
    );

    boolean existsByOfferedService(OfferedService offeredService);
}