package pnt.project.easy.appointment.service;

import java.util.List;

import pnt.project.easy.appointment.body.AppointmentCreateRequest;
import pnt.project.easy.appointment.body.AppointmentUpdateRequest;
import pnt.project.easy.appointment.model.Appointment;

public interface AppointmentService {

    List<Appointment> getAll();

    Appointment create(AppointmentCreateRequest request);
    Appointment cancel(Long id);
    Appointment getById(Long id);
    Appointment update(Long id, AppointmentUpdateRequest request);
    void delete(Long id);


}