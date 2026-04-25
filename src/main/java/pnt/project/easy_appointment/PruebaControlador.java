package pnt.project.easy_appointment;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;



/*
 * Controlador REST -> CLASE EN JAVA QUE EXPONE RUTAS HTTP  
 * para que otro sistema como un front haga peticiones y recibir respuestas en formato JSON
 * 
 Esta clase va a ser un controlador REST 
 */

@RestController  //controlador web en una API Rest
@RequestMapping("/micontroller")


public class PruebaControlador {
	
@GetMapping // indico que va a ser un metodo HTTP
	public String saludar() {
		return "Hola Mundo";
	}
	

}
