package pnt.project.easy.appointment.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pnt.project.easy.appointment.model.Professional;
import pnt.project.easy.appointment.model.enums.AppointmentStatus;
import pnt.project.easy.appointment.repository.AppointmentRepository;
import pnt.project.easy.appointment.repository.ProfessionalRepository;

@Service
public class ProfessionalServiceImpl implements ProfessionalService {

    private final ProfessionalRepository professionalRepository;
    private final AppointmentRepository appointmentRepository;

    public ProfessionalServiceImpl(ProfessionalRepository professionalRepository,
                                   AppointmentRepository appointmentRepository) {
        this.professionalRepository = professionalRepository;
        this.appointmentRepository = appointmentRepository;
    }

    @Override
    public Professional create(Professional professional) {

        String firstName = capitalizeWords(professional.getFirstName());
        String lastName = capitalizeWords(professional.getLastName());

        if (professionalRepository.existsByFirstNameAndLastName(firstName, lastName)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Professional is already registered"
            );
        }

        professional.setFirstName(firstName);
        professional.setLastName(lastName);

        return professionalRepository.save(professional);
    }

    @Override
    public List<Professional> getAll() {
        return professionalRepository.findByActiveTrue();
    }

    @Override
    public Professional getById(Long id) {
        return professionalRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Professional not found"
                ));
    }

    @Override
    public void delete(Long id) {

        Professional professional = getById(id);

        boolean hasActiveAppointments = appointmentRepository.existsByProfessionalAndStatus(
                professional,
                AppointmentStatus.ACTIVE
        );

        if (hasActiveAppointments) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Professional cannot be deleted because it has active appointments assigned"
            );
        }

        professional.setActive(false);
        professionalRepository.save(professional);
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