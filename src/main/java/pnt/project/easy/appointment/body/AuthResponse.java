package pnt.project.easy.appointment.body;

import pnt.project.easy.appointment.model.enums.UserRole;

public class AuthResponse {

    private Long id;
    private String name;
    private String email;
    private UserRole role;

    public AuthResponse() {
    }

    public AuthResponse(Long id, String name, String email, UserRole role) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

	public String getEmail() {
		return email;
	}

    public UserRole getRole() {
        return role;
    }
}