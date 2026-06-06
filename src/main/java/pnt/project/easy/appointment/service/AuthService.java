package pnt.project.easy.appointment.service;

import pnt.project.easy.appointment.body.AuthResponse; //entra cuando alguien se registra.
import pnt.project.easy.appointment.body.LoginRequest; //llega cuando alguien inicia sesion.
import pnt.project.easy.appointment.body.RegisterRequest; //llega cuando alguien se registra
//importamos los DTOs que usamos en este service


public interface AuthService {

	//operación de registrar un usuario
    AuthResponse register(RegisterRequest request);
    //operación de iniciar sesion
    AuthResponse login(LoginRequest request);
}