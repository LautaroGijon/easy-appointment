package pnt.project.easy.appointment.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import pnt.project.easy.appointment.model.OfferedService;
import pnt.project.easy.appointment.service.OfferedServiceService;

@RestController
@RequestMapping("/api/offered-services")
public class OfferedServiceController {

    private final OfferedServiceService offeredServiceService;

    public OfferedServiceController(OfferedServiceService offeredServiceService) {
        this.offeredServiceService = offeredServiceService;
    }

    @PostMapping
    public OfferedService create(@Valid @RequestBody OfferedService offeredService) {
        return offeredServiceService.create(offeredService);
    }

    @GetMapping
    public List<OfferedService> getAll() {
        return offeredServiceService.getAll();
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        offeredServiceService.delete(id);
    }
}