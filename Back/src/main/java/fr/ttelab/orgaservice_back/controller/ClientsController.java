package fr.ttelab.orgaservice_back.controller;

import fr.ttelab.orgaservice_back.dto.ClientDTO;
import fr.ttelab.orgaservice_back.entity.Client;
import fr.ttelab.orgaservice_back.entity.ClientStatus;
import fr.ttelab.orgaservice_back.entity.ClientType;
import fr.ttelab.orgaservice_back.repository.ClientRepository;
import fr.ttelab.orgaservice_back.util.MappingUtil;
import fr.ttelab.orgaservice_back.util.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/clients")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ACTIVE')")
public class ClientsController {

  private final ClientRepository clientRepository;
  private final SecurityUtil securityUtil;

  @GetMapping
  public List<ClientDTO> list(@RequestParam(required = false) String search){
    var owner = securityUtil.getCurrentUser();
    return clientRepository.findByOwnerAndSearch(owner, search).stream().map(MappingUtil::toClientDTO).toList();
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> get(@PathVariable String id){
    var owner = securityUtil.getCurrentUser();
    Optional<Client> client = clientRepository.findById(UUID.fromString(id)).filter(c -> c.getOwner().equals(owner));
    return client.<ResponseEntity<?>>map(value -> ResponseEntity.ok(MappingUtil.toClientDTO(value)))
        .orElseGet(() -> ResponseEntity.status(404).body(error("Client not found")));
  }

  @Data
  public static class ClientCreateRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String access;
    private Boolean hasKey = false;
    private ClientType type;
  }

  @PostMapping
  @Transactional
  public ResponseEntity<?> create(@RequestBody ClientCreateRequest req){
    if(req.getName()==null || req.getType()==null){
      return ResponseEntity.badRequest().body(error("Invalid request"));
    }
    var owner = securityUtil.getCurrentUser();
    Client c = new Client();
    c.setName(req.getName());
    c.setEmail(req.getEmail());
    c.setPhone(req.getPhone());
    c.setAddress(req.getAddress());
    c.setAccess(req.getAccess());
    c.setHasKey(Boolean.TRUE.equals(req.getHasKey()));
    c.setType(req.getType());
    c.setStatus(ClientStatus.actif);
    c.setOwner(owner);
    clientRepository.save(c);
    return ResponseEntity.created(URI.create("/api/clients/"+c.getId())).body(MappingUtil.toClientDTO(c));
  }

  @Data
  public static class ClientUpdateRequest {
    private String name;
    private String email;
    private String phone;
    private String address;
    private String access;
    private Boolean hasKey;
    private ClientType type;
    private ClientStatus status;
  }

  @PutMapping("/{id}")
  @Transactional
  public ResponseEntity<?> update(@PathVariable String id, @RequestBody ClientUpdateRequest req){
    var owner = securityUtil.getCurrentUser();
    Optional<Client> clientOpt = clientRepository.findById(UUID.fromString(id)).filter(c -> c.getOwner().equals(owner));
    if(clientOpt.isEmpty()){
      return ResponseEntity.status(404).body(error("Client not found"));
    }
    Client c = clientOpt.get();
    c.setName(req.getName());
    c.setEmail(req.getEmail());
    c.setPhone(req.getPhone());
    c.setAddress(req.getAddress());
    c.setAccess(req.getAccess());
    if(req.getHasKey()!=null) c.setHasKey(req.getHasKey());
    if(req.getType()!=null) c.setType(req.getType());
    if(req.getStatus()!=null) c.setStatus(req.getStatus());
    return ResponseEntity.ok(MappingUtil.toClientDTO(c));
  }

  @DeleteMapping("/{id}")
  @Transactional
  public ResponseEntity<?> delete(@PathVariable String id){
    var owner = securityUtil.getCurrentUser();
    Optional<Client> clientOpt = clientRepository.findById(UUID.fromString(id)).filter(c -> c.getOwner().equals(owner));
    if(clientOpt.isEmpty()){
      return ResponseEntity.status(404).build();
    }
    clientRepository.delete(clientOpt.get());
    return ResponseEntity.noContent().build();
  }

  private static record ErrorResponse(String error, String details) {}
  private ErrorResponse error(String details){
    return new ErrorResponse("Invalid request", details);
  }
}
