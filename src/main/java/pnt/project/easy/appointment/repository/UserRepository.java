package pnt.project.easy.appointment.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import pnt.project.easy.appointment.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}