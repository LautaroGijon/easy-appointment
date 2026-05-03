package pnt.project.easy.appointment.service;

import java.util.List;

import pnt.project.easy.appointment.model.Professional;

public interface ProfessionalService {
	Professional create(Professional professional);
    List<Professional> getAll();
    Professional getById(Long id);
    void delete(Long id);
}
