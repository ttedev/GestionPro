package fr.ttelab.orgaservice_back.config;

import fr.ttelab.orgaservice_back.entity.*;
import fr.ttelab.orgaservice_back.repository.ClientRepository;
import fr.ttelab.orgaservice_back.repository.ProjectRepository;
import fr.ttelab.orgaservice_back.repository.UserRepository;
import fr.ttelab.orgaservice_back.service.ProjectServcie;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.LocalTime;
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
  private ProjectRepository projectRepository;

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
    user.setWorkEndTime(LocalTime.of(15,00));
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

    // Client 4
    Client client4 = new Client();
    client4.setName("Sophie Martin");
    client4.setStatus(ClientStatus.actif);
    client4.setType(ClientType.professionnel);
    client4.setOwner(user);
    client4.setEmail("client4@example.com");
    client4.setPhone("0734567890");
    Adress adress5 = new Adress();
    adress5.setClient(client4);
    adress5.setStreet("45 avenue des Champs");
    adress5.setOrder(0);
    adress5.setCity("Lyon");
    adress5.setPostalCode("69000");
    adress5.setAcces("Building B");
    adress5.setHasKey(true);
    client4.getAddresses().add(adress5);
    client4.setCreatedAt(LocalDateTime.now());

    clientRepository.save(client4);

    // Client 5
    Client client5 = new Client();
    client5.setName("Marc Dubois");
    client5.setStatus(ClientStatus.actif);
    client5.setType(ClientType.particulier);
    client5.setOwner(user);
    client5.setEmail("client5@example.com");
    client5.setPhone("0745678901");
    Adress adress6 = new Adress();
    adress6.setClient(client5);
    adress6.setStreet("8 rue du Faubourg");
    adress6.setOrder(0);
    adress6.setCity("Marseille");
    adress6.setPostalCode("13000");
    adress6.setHasKey(false);
    client5.getAddresses().add(adress6);
    client5.setCreatedAt(LocalDateTime.now());

    clientRepository.save(client5);

    // Projets Client 1
    Project project1 = new Project();
    project1.setTitle("Rénovation Salon");
    project1.setDescription("Rénovation complète du salon avec nouveaux meubles et peinture.");
    project1.setOwner(user);
    project1.setClient(client1);
    project1.setCreatedAt(LocalDateTime.now());
    project1.setDureeMois(2);
    project1.setPremierMois("2026-02");
    List<PlanTravauxItem> planTravauxItems = new java.util.ArrayList<>();
    PlanTravauxItem mois = new PlanTravauxItem();
    mois.setMois("2026-02");
    mois.setOccurence(15);
    PlanTravauxItem mois2= new PlanTravauxItem();
    mois2.setMois("2026-03");
    mois2.setOccurence(10);
    planTravauxItems.add(mois);
    planTravauxItems.add(mois2);
    project1.setPlanTravaux(planTravauxItems);
    project1.setDureeEnMinutes(120);
    project1.setType(ProjectType.recurrent);
    projectServcie.genereateChantierForProject(project1);
    projectRepository.save(project1);

    Project project2 = new Project();
    project2.setTitle("Installation Cuisine");
    project2.setDescription("Installation d'une nouvelle cuisine équipée.");
    project2.setOwner(user);
    project2.setClient(client1);
    project2.setCreatedAt(LocalDateTime.now());
    project2.setType(ProjectType.ponctuel);
    project2.setDureeEnMinutes(180);
    projectServcie.genereateChantierForProject(project2);
    projectRepository.save(project2);

    // Projets Client 2
    Project project3 = new Project();
    project3.setTitle("Entretien Bureaux");
    project3.setDescription("Entretien mensuel des bureaux professionnels.");
    project3.setOwner(user);
    project3.setClient(client2);
    project3.setCreatedAt(LocalDateTime.now());
    project3.setDureeMois(6);
    project3.setPremierMois("2026-02");
    List<PlanTravauxItem> planTravauxItems3 = new java.util.ArrayList<>();
    for (int i = 0; i < 6; i++) {
      PlanTravauxItem item = new PlanTravauxItem();
      item.setMois("2026-" + String.format("%02d", i + 2));
      item.setOccurence(20);
      planTravauxItems3.add(item);
    }
    project3.setPlanTravaux(planTravauxItems3);
    project3.setDureeEnMinutes(90);
    project3.setType(ProjectType.recurrent);
    projectServcie.genereateChantierForProject(project3);
    projectRepository.save(project3);

    Project project4 = new Project();
    project4.setTitle("Dépannage Urgent");
    project4.setDescription("Dépannage d'urgence suite à fuites d'eau.");
    project4.setOwner(user);
    project4.setClient(client2);
    project4.setCreatedAt(LocalDateTime.now());
    project4.setType(ProjectType.ponctuel);
    project4.setDureeEnMinutes(120);
    projectServcie.genereateChantierForProject(project4);
    projectRepository.save(project4);

    // Projets Client 3
    Project project5 = new Project();
    project5.setTitle("Nettoyage Maison");
    project5.setDescription("Nettoyage complet de la maison toutes les deux semaines.");
    project5.setOwner(user);
    project5.setClient(client3);
    project5.setCreatedAt(LocalDateTime.now());
    project5.setDureeMois(3);
    project5.setPremierMois("2026-02");
    List<PlanTravauxItem> planTravauxItems5 = new java.util.ArrayList<>();
    PlanTravauxItem item5_1 = new PlanTravauxItem();
    item5_1.setMois("2026-02");
    item5_1.setOccurence(8);
    PlanTravauxItem item5_2 = new PlanTravauxItem();
    item5_2.setMois("2026-03");
    item5_2.setOccurence(8);
    PlanTravauxItem item5_3 = new PlanTravauxItem();
    item5_3.setMois("2026-04");
    item5_3.setOccurence(8);
    planTravauxItems5.add(item5_1);
    planTravauxItems5.add(item5_2);
    planTravauxItems5.add(item5_3);
    project5.setPlanTravaux(planTravauxItems5);
    project5.setDureeEnMinutes(150);
    project5.setType(ProjectType.recurrent);
    projectServcie.genereateChantierForProject(project5);
    projectRepository.save(project5);

    Project project6 = new Project();
    project6.setTitle("Réparation Toiture");
    project6.setDescription("Réparation partielle de la toiture.");
    project6.setOwner(user);
    project6.setClient(client3);
    project6.setCreatedAt(LocalDateTime.now());
    project6.setType(ProjectType.ponctuel);
    project6.setDureeEnMinutes(240);
    projectServcie.genereateChantierForProject(project6);
    projectRepository.save(project6);

    // Projets Client 4
    Project project7 = new Project();
    project7.setTitle("Maintenance Informatique");
    project7.setDescription("Maintenance mensuelle du parc informatique.");
    project7.setOwner(user);
    project7.setClient(client4);
    project7.setCreatedAt(LocalDateTime.now());
    project7.setDureeMois(12);
    project7.setPremierMois("2026-02");
    List<PlanTravauxItem> planTravauxItems7 = new java.util.ArrayList<>();
    for (int i = 0; i < 12; i++) {
      PlanTravauxItem item = new PlanTravauxItem();
      int month = i + 2;
      int year = 2026;
      if (month > 12) {
        month = month - 12;
        year = 2027;
      }
      item.setMois(year + "-" + String.format("%02d", month));
      item.setOccurence(5);
      planTravauxItems7.add(item);
    }
    project7.setPlanTravaux(planTravauxItems7);
    project7.setDureeEnMinutes(120);
    project7.setType(ProjectType.recurrent);
    projectServcie.genereateChantierForProject(project7);
    projectRepository.save(project7);

    Project project8 = new Project();
    project8.setTitle("Formation Équipe");
    project8.setDescription("Formation du personnel sur les nouveaux outils.");
    project8.setOwner(user);
    project8.setClient(client4);
    project8.setCreatedAt(LocalDateTime.now());
    project8.setType(ProjectType.ponctuel);
    project8.setDureeEnMinutes(300);
    projectServcie.genereateChantierForProject(project8);
    projectRepository.save(project8);

    // Projets Client 5
    Project project9 = new Project();
    project9.setTitle("Suivi Jardinage");
    project9.setDescription("Suivi du jardinage et entretien des espaces verts.");
    project9.setOwner(user);
    project9.setClient(client5);
    project9.setCreatedAt(LocalDateTime.now());
    project9.setDureeMois(4);
    project9.setPremierMois("2026-02");
    List<PlanTravauxItem> planTravauxItems9 = new java.util.ArrayList<>();
    PlanTravauxItem item9_1 = new PlanTravauxItem();
    item9_1.setMois("2026-02");
    item9_1.setOccurence(12);
    PlanTravauxItem item9_2 = new PlanTravauxItem();
    item9_2.setMois("2026-03");
    item9_2.setOccurence(12);
    PlanTravauxItem item9_3 = new PlanTravauxItem();
    item9_3.setMois("2026-04");
    item9_3.setOccurence(12);
    PlanTravauxItem item9_4 = new PlanTravauxItem();
    item9_4.setMois("2026-05");
    item9_4.setOccurence(12);
    planTravauxItems9.add(item9_1);
    planTravauxItems9.add(item9_2);
    planTravauxItems9.add(item9_3);
    planTravauxItems9.add(item9_4);
    project9.setPlanTravaux(planTravauxItems9);
    project9.setDureeEnMinutes(180);
    project9.setType(ProjectType.recurrent);
    projectServcie.genereateChantierForProject(project9);
    projectRepository.save(project9);

    Project project10 = new Project();
    project10.setTitle("Paysagisme Complet");
    project10.setDescription("Aménagement paysager complet du jardin.");
    project10.setOwner(user);
    project10.setClient(client5);
    project10.setCreatedAt(LocalDateTime.now());
    project10.setType(ProjectType.ponctuel);
    project10.setDureeEnMinutes(360);
    projectServcie.genereateChantierForProject(project10);
    projectRepository.save(project10);

    // Associer les projets aux clients
    client1.setProjects(java.util.List.of(project1, project2));
    client2.setProjects(java.util.List.of(project3, project4));
    client3.setProjects(java.util.List.of(project5, project6));
    client4.setProjects(java.util.List.of(project7, project8));
    client5.setProjects(java.util.List.of(project9, project10));

    // Sauvegarder les clients
    clientRepository.save(client1);
    clientRepository.save(client2);
    clientRepository.save(client3);
    clientRepository.save(client4);
    clientRepository.save(client5);







  }


}
