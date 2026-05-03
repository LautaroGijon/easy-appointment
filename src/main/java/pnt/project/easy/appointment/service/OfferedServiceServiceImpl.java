package pnt.project.easy.appointment.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pnt.project.easy.appointment.model.OfferedService;
import pnt.project.easy.appointment.repository.AppointmentRepository;
import pnt.project.easy.appointment.repository.OfferedServiceRepository;

@Service
public class OfferedServiceServiceImpl implements OfferedServiceService {

    private final OfferedServiceRepository offeredServiceRepository;
    private final AppointmentRepository appointmentRepository;

    public OfferedServiceServiceImpl(OfferedServiceRepository offeredServiceRepository,
                                     AppointmentRepository appointmentRepository) {
        this.offeredServiceRepository = offeredServiceRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public OfferedService create(OfferedService offeredService) {

        offeredService.setName(capitalizeWords(offeredService.getName()));

        if (offeredServiceRepository.existsByName(offeredService.getName())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Service name is already registered"
            );
        }

        return offeredServiceRepository.save(offeredService);
    }

    @Override
    public List<OfferedService> getAll() {
        return offeredServiceRepository.findAll();
    }

    @Override
    public void delete(Long id) {

        OfferedService offeredService = offeredServiceRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Service not found"
                ));

        boolean hasAppointments = appointmentRepository.existsByOfferedService(offeredService);

        if (hasAppointments) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Service cannot be deleted because it has appointments assigned"
            );
        }

        offeredServiceRepository.delete(offeredService);
    }
    
    private String capitalizeWords(String text) {
        if (text == null || text.isBlank()) {
            return text;
        }

        String[] words = text.trim().toLowerCase().split("\\s+");
        StringBuilder result = new StringBuilder();

        for (String word : words) {
            result.append(word.substring(0, 1).toUpperCase())
                  .append(word.substring(1))
                  .append(" ");
        }

        return result.toString().trim();
    }
}