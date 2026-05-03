package pnt.project.easy.appointment.service;

import pnt.project.easy.appointment.body.AuthResponse;
import pnt.project.easy.appointment.body.LoginRequest;
import pnt.project.easy.appointment.body.RegisterRequest;

public interface AuthService {

    AuthResponse register(RegisterRequest request);

    AuthResponse login(LoginRequest request);
}