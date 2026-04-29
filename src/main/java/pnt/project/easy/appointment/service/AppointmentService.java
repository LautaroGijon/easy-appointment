package pnt.project.easy.appointment.service;

import java.util.List;

import pnt.project.easy.appointment.entity.Appointment;
public interface AppointmentService {

	List<Appointment> getAll();

    Appointment create(Appointment appointment);
    Appointment cancel(Long id);
}
