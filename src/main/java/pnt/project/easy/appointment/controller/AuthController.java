package pnt.project.easy.appointment.controller;

import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import pnt.project.easy.appointment.body.AuthResponse;
import pnt.project.easy.appointment.body.LoginRequest;
import pnt.project.easy.appointment.body.RegisterRequest;
import pnt.project.easy.appointment.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }
}