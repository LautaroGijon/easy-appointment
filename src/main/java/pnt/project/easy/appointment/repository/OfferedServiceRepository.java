package pnt.project.easy.appointment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import pnt.project.easy.appointment.model.OfferedService;

public interface OfferedServiceRepository extends JpaRepository<OfferedService, Long> {

	boolean existsByName(String name);
	
	
	
}