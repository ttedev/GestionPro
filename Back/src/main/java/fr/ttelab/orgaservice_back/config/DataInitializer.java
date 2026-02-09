package fr.ttelab.orgaservice_back.config;

import fr.ttelab.orgaservice_back.entity.*;
import fr.ttelab.orgaservice_back.repository.ClientRepository;
import fr.ttelab.orgaservice_back.repository.UserRepository;
import fr.ttelab.orgaservice_back.service.ProjectServcie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@ConditionalOnProperty(name = "PRODUCTION_MODE", havingValue = "false", matchIfMissing = true)
public class DataInitializer implements CommandLineRunner {
  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Autowired
  private ClientRepository clientRepository;

  @Autowired
  private ProjectServcie projectServcie;

  @Override
  public void run(String... args){
    User user = new User();
    user.setCompany("Xavier Corp");
    user.setFirstName("Admin");
    user.setLastName("ADMIN");
    user.setUsername("admin@admin.admin");
    user.setPassword(passwordEncoder.encode("admin"));
    user.setEmail("admin@admin.admin");
    UserStatus status = UserStatus.ACTIVE ;
    user.setStatus(status);
    user.setEndLicenseDate(LocalDateTime.now().plusDays(1).toLocalDate());
    userRepository.save(user);

    Client client1 = new Client();
    client1.setName("Dupont");
    client1.setStatus(ClientStatus.actif);
    client1.setType(ClientType.particulier);
    client1.setOwner(user);
    client1.setEmail("client@example.com");
    client1.setPhone("0688776655");
    Adress adress = new Adress();
    adress.setClient(client1);
    adress.setOrder(0);
    adress.setStreet("21 rue du moche");
    adress.setCity("Pau");
    adress.setPostalCode("64000");
    adress.setAcces("1243");
    adress.setHasKey(true);
    Adress adress2 = new Adress();
    adress2.setClient(client1);
    adress2.setStreet("12 rue du moche ");
    adress2.setOrder(1);
    adress2.setCity("Paris");
    adress2.setPostalCode("75000");
    adress2.setHasKey(false);
    client1.getAddresses().add(adress);
    client1.getAddresses().add(adress2);
    client1.setCreatedAt(LocalDateTime.now());

    clientRepository.save(client1);

    Client client2 = new Client();
    client2.setName("Myriam la Verte");
    client2.setStatus(ClientStatus.actif);
    client2.setType(ClientType.professionnel);
    client2.setOwner(user);
    client2.setEmail("client2@example.com");
    client2.setPhone("0666666655");
    Adress adress3 = new Adress();
    adress3.setClient(client2);
    adress3.setStreet("12 rue de la jolie ");
    adress3.setOrder(0);
    adress3.setCity("Pau");
    adress3.setPostalCode("64000");
    adress3.setAcces("A56778");
    adress3.setHasKey(false);
    client2.getAddresses().add(adress3);
    client2.setCreatedAt(LocalDateTime.now());

    clientRepository.save(client2);

    Client client3 = new Client();
    client3.setName("Jean Le grand");
    client3.setStatus(ClientStatus.actif);
    client3.setType(ClientType.particulier);
    client3.setOwner(user);
    client3.setEmail("client3@example.com");
    client3.setPhone("0712121212");
    Adress adress4 = new Adress();
    adress4.setClient(client3);
    adress4.setStreet("2 rue du chemin rouge ");
    adress4.setOrder(0);
    adress4.setCity("Pau");
    adress4.setPostalCode("64000");
    adress4.setHasKey(false);
    client3.getAddresses().add(adress4);
    client3.setCreatedAt(LocalDateTime.now());

    clientRepository.save(client3);

    Project project1 = new Project();
    project1.setTitle("Rénovation Salon");
    project1.setDescription("Rénovation complète du salon avec nouveaux meubles et peinture.");
    project1.setOwner(user);
    project1.setClient(client1);
    project1.setCreatedAt(LocalDateTime.now());
    project1.setDureeMois(2);
    project1.setPremierMois("2025-11");
    List<PlanTravauxItem> planTravauxItems = new java.util.ArrayList<>();
    PlanTravauxItem mois = new PlanTravauxItem();
    mois.setMois("2025-11");
    mois.setOccurence(15);
    PlanTravauxItem mois2= new PlanTravauxItem();
    mois2.setMois("2025-12");
    mois2.setOccurence(10);
    planTravauxItems.add(mois);
    planTravauxItems.add(mois2);
    project1.setPlanTravaux(planTravauxItems);
    project1.setDureeEnMinutes(120);
    project1.setType(ProjectType.recurrent);
    projectServcie.genereateChantierForProject(project1);


    client1.setProjects(java.util.List.of(project1));

    Project project2 = new Project();
    project2.setTitle("Installation Cuisine");
    project2.setDescription("Installation d'une nouvelle cuisine équipée.");
    project2.setOwner(user);
    project2.setClient(client2);
    project2.setCreatedAt(LocalDateTime.now());
    project2.setType(ProjectType.ponctuel);
    project2.setDureeEnMinutes(180);
    projectServcie.genereateChantierForProject(project2);
    client2.setProjects(List.of(project2));
    clientRepository.save(client2);
    clientRepository.save(client1);





  }


}
