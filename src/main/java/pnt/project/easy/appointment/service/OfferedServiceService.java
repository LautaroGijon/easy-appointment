package pnt.project.easy.appointment.service;

import java.util.List;

import pnt.project.easy.appointment.model.OfferedService;

public interface OfferedServiceService {

    OfferedService create(OfferedService offeredService);

    List<OfferedService> getAll();

    void delete(Long id);
}