package fr.ttelab.orgaservice_back;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableMethodSecurity
public class OrgaserviceBackApplication {

	public static void main(String[] args) {
		SpringApplication.run(OrgaserviceBackApplication.class, args);
	}

}
