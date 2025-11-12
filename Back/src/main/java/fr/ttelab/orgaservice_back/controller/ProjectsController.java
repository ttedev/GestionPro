package fr.ttelab.orgaservice_back.controller;

import fr.ttelab.orgaservice_back.dto.ChantierDTO;
import fr.ttelab.orgaservice_back.dto.PlanTravauxItemDTO;
import fr.ttelab.orgaservice_back.dto.ProjectDTO;
import fr.ttelab.orgaservice_back.entity.*;
import fr.ttelab.orgaservice_back.repository.ClientRepository;
import fr.ttelab.orgaservice_back.repository.ProjectRepository;
import fr.ttelab.orgaservice_back.service.ProjectServcie;
import fr.ttelab.orgaservice_back.util.MappingUtil;
import fr.ttelab.orgaservice_back.util.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ACTIVE')")
public class ProjectsController {
  private final ProjectRepository projectRepository;
  private final ClientRepository clientRepository;
  private final SecurityUtil securityUtil;
  private final ProjectServcie projectServcie;

  @Data
  public static class ProjectCreateRequest {
    private UUID clientId;
    private String title;
    private String description;
    private ProjectStatus status;
    private Integer dureeEnMinutes;
    private ProjectType type;
    private Integer dureeMois;
    private String premierMois;
    private List<PlanTravauxItemDTO> planTravaux;
    private LocalDateTime createdAt;  }


  @GetMapping
  public List<ProjectDTO> list(@RequestParam(required = false) String clientId,
                               @RequestParam(required = false) ProjectStatus status){
    var owner = securityUtil.getCurrentUser();
    List<Project> projects;
    if(clientId!=null && status!=null){
      projects = projectRepository.findByOwnerAndClient_IdAndStatus(owner, UUID.fromString(clientId), status);
    } else if(clientId!=null){
      projects = projectRepository.findByOwnerAndClient_Id(owner, UUID.fromString(clientId));
    } else if(status!=null){
      projects = projectRepository.findByOwnerAndStatus(owner, status);
    } else {
      projects = projectRepository.findByOwner(owner);
    }
    return projects.stream().map(MappingUtil::toProjectDTO).toList();
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> get(@PathVariable String id){
    var owner = securityUtil.getCurrentUser();
    Optional<Project> opt = projectRepository.findById(UUID.fromString(id)).filter(p -> p.getOwner().equals(owner));
    return opt.<ResponseEntity<?>>map(value -> ResponseEntity.ok(MappingUtil.toProjectDTO(value)))
        .orElseGet(() -> ResponseEntity.status(404).body(error("Project not found")));
  }



  @PostMapping
  @Transactional
  public ResponseEntity<?> create(@RequestBody ProjectCreateRequest req){
    if(req.getClientId()==null || req.getTitle()==null){
      return ResponseEntity.badRequest().body(error("Invalid request"));
    }
    var owner = securityUtil.getCurrentUser();
    Client client = clientRepository.findById(req.getClientId()).filter(c -> c.getOwner().equals(owner)).orElse(null);
    if(client==null) return ResponseEntity.status(404).body(error("Client not found"));
    Project p = new Project();
    p.setClient(client);
    p.setOwner(owner);
    p.setTitle(req.getTitle());
    p.setDescription(req.getDescription());
    p.setStatus(req.getStatus()!=null?req.getStatus():ProjectStatus.en_attente);
    p.setDureeEnMinutes(req.getDureeEnMinutes());
    p.setPremierMois(req.getPremierMois());
    p.setDureeMois(req.getDureeMois());
    p.setType(req.getType()!=null?req.getType():ProjectType.ponctuel);
    if(req.getType()==ProjectType.recurrent && req.getPlanTravaux()!=null){
      List<PlanTravauxItem> planTravaux = req.getPlanTravaux().stream().map(dto -> {
        PlanTravauxItem item = new PlanTravauxItem();
        item.setOccurence(dto.getOccurence());
        item.setMois(dto.getMois());
        return item;
      }).toList();
      p.setPlanTravaux(planTravaux);
    }
    projectRepository.save(p);

    projectServcie.genereateChantierForProject(p);

    return ResponseEntity.created(URI.create("/api/projects/"+p.getId())).body(MappingUtil.toProjectDTO(p));
  }

  @Data
  public static class ProjectUpdateRequest {
    private String title;
    private String description;
    private ProjectStatus status;
    private java.time.LocalDate startDate;
    private java.time.LocalDate endDate;
    private Integer dureeEnMinutes;

  }

  @PutMapping("/{id}")
  @Transactional
  public ResponseEntity<?> update(@PathVariable String id, @RequestBody ProjectUpdateRequest req){
    var owner = securityUtil.getCurrentUser();
    Optional<Project> opt = projectRepository.findById(UUID.fromString(id)).filter(p -> p.getOwner().equals(owner));
    if(opt.isEmpty()) return ResponseEntity.status(404).body(error("Project not found"));
    Project p = opt.get();
    p.setTitle(req.getTitle());
    p.setDescription(req.getDescription());
    if(req.getStatus()!=null) p.setStatus(req.getStatus());
    p.setDureeEnMinutes(req.getDureeEnMinutes());
    return ResponseEntity.ok(MappingUtil.toProjectDTO(p));
  }

  @DeleteMapping("/{id}")
  @Transactional
  public ResponseEntity<?> delete(@PathVariable String id){
    var owner = securityUtil.getCurrentUser();
    Optional<Project> opt = projectRepository.findById(UUID.fromString(id)).filter(p -> p.getOwner().equals(owner));
    if(opt.isEmpty()) return ResponseEntity.status(404).build();
    projectRepository.delete(opt.get());
    return ResponseEntity.noContent().build();
  }

  private static record ErrorResponse(String error, String details) {}
  private ErrorResponse error(String details){
    return new ErrorResponse("Invalid request", details);
  }
}
