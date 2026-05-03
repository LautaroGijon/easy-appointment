package pnt.project.easy.appointment.service;
import java.util.List;

import org.springframework.stereotype.Service;

import pnt.project.easy.appointment.model.Professional;
import pnt.project.easy.appointment.repository.ProfessionalRepository;


@Service
public class ProfessionalServiceImpl implements ProfessionalService {
	
	
	 private final ProfessionalRepository professionalRepository;

	    public ProfessionalServiceImpl(ProfessionalRepository professionalRepository) {
	        this.professionalRepository = professionalRepository;
	    }

	    @Override
	    public Professional create(Professional professional) {
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
	        professionalRepository.deleteById(id);
	    }
	

}
