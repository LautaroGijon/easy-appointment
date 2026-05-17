package pnt.project.easy.appointment.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import pnt.project.easy.appointment.body.AuthResponse;
import pnt.project.easy.appointment.body.LoginRequest;
import pnt.project.easy.appointment.body.RegisterRequest;
import pnt.project.easy.appointment.model.User;
import pnt.project.easy.appointment.model.enums.UserRole;
import pnt.project.easy.appointment.repository.UserRepository;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;

    public AuthServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {

        validateFullName(request.getName());

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email is already registered"
            );
        }

        User user = new User();

        user.setName(capitalizeWords(request.getName()));
        user.setEmail(email);
        user.setPassword(request.getPassword());
        user.setRole(UserRole.CLIENT);

        User savedUser = userRepository.save(user);

        return new AuthResponse(
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {

        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Invalid email or password"
                ));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Invalid email or password"
            );
        }

        return new AuthResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
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

    private void validateFullName(String name) {
        if (name == null || name.trim().split("\\s+").length < 2) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Debe ingresar nombre y apellido"
            );
        }
    }
}