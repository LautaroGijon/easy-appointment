package pnt.project.easy.appointment.service;
import java.util.List;

import org.springframework.stereotype.Service;

import pnt.project.easy.appointment.model.Professional;
import pnt.project.easy.appointment.repository.ProfessionalRepository;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import pnt.project.easy.appointment.repository.AppointmentRepository;

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
	    	professional.setFirstName(capitalizeWords(professional.getFirstName()));
	    	professional.setLastName(capitalizeWords(professional.getLastName()));
	        return professionalRepository.save(professional);
	    }

	    @Override
	    public List<Professional> getAll() {
	        return professionalRepository.findAll();
	    }

	    @Override
	    public Professional getById(Long id) {
	        return professionalRepository.findById(id)
	                .orElseThrow(() -> new RuntimeException("Professional not found"));
	    }

	    @Override
	    public void delete(Long id) {
	        Professional professional = professionalRepository.findById(id)
	                .orElseThrow(() -> new ResponseStatusException(
	                        HttpStatus.NOT_FOUND,
	                        "Professional not found"
	                ));

	        boolean hasAppointments = appointmentRepository.existsByProfessional(professional);

	        if (hasAppointments) {
	            throw new ResponseStatusException(
	                    HttpStatus.CONFLICT,
	                    "Professional cannot be deleted because it has appointments assigned"
	            );
	        }

	        professionalRepository.delete(professional);
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
