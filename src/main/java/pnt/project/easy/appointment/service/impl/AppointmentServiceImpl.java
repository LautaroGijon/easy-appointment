package pnt.project.easy.appointment.service.impl;

import java.util.List;
import pnt.project.easy.appointment.entity.enums.AppointmentStatus;

import org.springframework.stereotype.Service;

import pnt.project.easy.appointment.entity.Appointment;
import pnt.project.easy.appointment.repository.AppointmentRepository;
import pnt.project.easy.appointment.service.AppointmentService;

@Service
public class AppointmentServiceImpl implements AppointmentService {

    private final AppointmentRepository appointmentRepository;

    public AppointmentServiceImpl(AppointmentRepository appointmentRepository) {
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public List<Appointment> getAll() {
        return appointmentRepository.findAll();
    }

    @Override
    public Appointment create(Appointment appointment) {
        return appointmentRepository.save(appointment);
    }

	@Override
	public Appointment cancel(Long id) {
		  Appointment appointment = appointmentRepository.findById(id)
		            .orElseThrow(() -> new RuntimeException("Appointment not found"));

		    if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
		        throw new RuntimeException("Appointment is already cancelled");
		    }

		    appointment.setStatus(AppointmentStatus.CANCELLED);

		    return appointmentRepository.save(appointment);
		}
    
    
    
    
    
    
}