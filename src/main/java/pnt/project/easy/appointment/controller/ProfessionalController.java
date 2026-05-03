package pnt.project.easy.appointment.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import pnt.project.easy.appointment.model.Professional;
import pnt.project.easy.appointment.service.ProfessionalService;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/professionals")
public class ProfessionalController {

    private final ProfessionalService professionalService;

    public ProfessionalController(ProfessionalService professionalService) {
        this.professionalService = professionalService;
    }

    @PostMapping
    public Professional create(@Valid @RequestBody Professional professional) {
        return professionalService.create(professional);
    }

    @GetMapping
    public List<Professional> getAll() {
        return professionalService.getAll();
    }

    @GetMapping("/{id}")
    public Professional getById(@PathVariable Long id) {
        return professionalService.getById(id);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        professionalService.delete(id);
    }
}