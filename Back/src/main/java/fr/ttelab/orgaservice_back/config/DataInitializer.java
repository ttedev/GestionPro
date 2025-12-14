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
    client1.setAccess("1243");
    client1.setName("Dupont");
    client1.setStatus(ClientStatus.actif);
    client1.setType(ClientType.particulier);
    client1.setOwner(user);
    client1.setEmail("client@example.com");
    client1.setPhone("0688776655");
    client1.setHasKey(false);
    client1.setAddress("2 rue du chemin vert");
    client1.setCreatedAt(LocalDateTime.now());

    clientRepository.save(client1);

    Client client2 = new Client();
    client2.setAccess("A56778");
    client2.setName("Myriam la Verte");
    client2.setStatus(ClientStatus.actif);
    client2.setType(ClientType.professionnel);
    client2.setOwner(user);
    client2.setEmail("client2@example.com");
    client2.setPhone("0666666655");
    client2.setHasKey(false);
    client2.setAddress("2 rue du chemin bleu");
    client2.setCreatedAt(LocalDateTime.now());

    clientRepository.save(client2);

    Client client3 = new Client();
    client3.setName("Jean Le grand");
    client3.setStatus(ClientStatus.actif);
    client3.setType(ClientType.particulier);
    client3.setOwner(user);
    client3.setEmail("client3@example.com");
    client3.setPhone("0712121212");
    client3.setHasKey(false);
    client3.setAddress("2 rue du chemin rouge");
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
