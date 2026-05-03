package pnt.project.easy.appointment.controller;

import java.util.List;import pnt.project.easy.appointment.body.AppointmentUpdateRequest;

import pnt.project.easy.appointment.body.AppointmentCreateRequest;
import pnt.project.easy.appointment.model.Appointment;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import pnt.project.easy.appointment.service.AppointmentService;

@RestController
@RequestMapping("/api/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public List<Appointment> getAll() {
        return appointmentService.getAll();
    }

    @PostMapping
    public Appointment create(@Valid @RequestBody AppointmentCreateRequest request) {
        return appointmentService.create(request);
    }
    
    @PutMapping("/{id}/cancel")
    public Appointment cancel(@PathVariable Long id) {
        return appointmentService.cancel(id);
    }
    
    
    @GetMapping("/{id}")
    public Appointment getById(@PathVariable Long id) {
        return appointmentService.getById(id);
    }
    
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        appointmentService.delete(id);
    }
    
    @PutMapping("/{id}")
    public Appointment update(
            @PathVariable Long id,
            @Valid @RequestBody AppointmentUpdateRequest request) {

        return appointmentService.update(id, request);
    }
    
    
    
}