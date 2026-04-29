package pnt.project.easy.appointment.repository;


import org.springframework.data.jpa.repository.JpaRepository;
import pnt.project.easy.appointment.entity.Professional;


public interface ProfessionalRepository extends JpaRepository<Professional, Long>  {

}
