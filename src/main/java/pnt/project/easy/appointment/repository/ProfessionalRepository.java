package pnt.project.easy.appointment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import pnt.project.easy.appointment.model.Professional;

public interface ProfessionalRepository extends JpaRepository<Professional, Long> {

    boolean existsByFirstNameAndLastName(String firstName, String lastName);

    List<Professional> findByActiveTrue();
}