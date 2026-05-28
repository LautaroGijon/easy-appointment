package pnt.project.easy.appointment.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import pnt.project.easy.appointment.model.Appointment;
import pnt.project.easy.appointment.model.Professional;
import pnt.project.easy.appointment.model.enums.AppointmentStatus;
import pnt.project.easy.appointment.model.OfferedService;

import java.time.LocalDate;
import java.time.LocalTime;
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
	
	boolean existsByProfessional(Professional professional);
	
	
	boolean existsByOfferedService(OfferedService offeredService);
	
	boolean existsByProfessionalAndStatus(Professional professional, AppointmentStatus status);
}
