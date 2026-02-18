package fr.ttelab.orgaservice_back.controller;

import fr.ttelab.orgaservice_back.dto.ClientDTO;
import fr.ttelab.orgaservice_back.entity.Adress;
import fr.ttelab.orgaservice_back.entity.Client;
import fr.ttelab.orgaservice_back.entity.ClientStatus;
import fr.ttelab.orgaservice_back.entity.ClientType;
import fr.ttelab.orgaservice_back.repository.ClientRepository;
import fr.ttelab.orgaservice_back.util.MappingUtil;
import fr.ttelab.orgaservice_back.util.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.apache.logging.log4j.util.Strings;
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
    return clientRepository.findByOwnerAndSearch(owner, search).stream()
        .map(MappingUtil::toClientDTO)
        .sorted((a, b) -> a.getName().compareToIgnoreCase(b.getName()))
        .toList();
  }

  @GetMapping("/{id}")
  public ResponseEntity<?> get(@PathVariable String id){
    var owner = securityUtil.getCurrentUser();
    Optional<Client> client = clientRepository.findById(UUID.fromString(id)).filter(c -> c.getOwner().equals(owner));
    return client.<ResponseEntity<?>>map(value -> ResponseEntity.ok(MappingUtil.toClientDTO(value)))
        .orElseGet(() -> ResponseEntity.status(404).body(error("Client not found")));
  }

  @Data
  public static class AddressRequest {
    private String street;
    private String city;
    private String postalCode;
    private String acces;
    private Integer order;
    private Boolean hasKey = false;
  }

  @Data
  public static class ClientCreateRequest {
    private String name;
    private String email;
    private String phone;
    private List<AddressRequest> addresses;
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
    c.setPhone(Strings.isBlank(req.getPhone()) ? "":req.getPhone().trim());
    c.setType(req.getType());
    c.setStatus(ClientStatus.actif);
    c.setOwner(owner);

    // Ajouter les adresses
    if (req.getAddresses() != null) {
      for (int i = 0; i < req.getAddresses().size(); i++) {
        AddressRequest addrReq = req.getAddresses().get(i);
        Adress adress = new Adress();
        adress.setStreet(addrReq.getStreet());
        adress.setCity(addrReq.getCity());
        adress.setPostalCode(addrReq.getPostalCode());
        adress.setAcces(addrReq.getAcces());
        adress.setOrder(addrReq.getOrder() != null ? addrReq.getOrder() : i);
        adress.setHasKey(Boolean.TRUE.equals(addrReq.getHasKey()));
        adress.setClient(c);
        c.getAddresses().add(adress);
      }
    }

    clientRepository.save(c);
    return ResponseEntity.created(URI.create("/api/clients/"+c.getId())).body(MappingUtil.toClientDTO(c));
  }

  @Data
  public static class ClientUpdateRequest {
    private String name;
    private String email;
    private String phone;
    private List<AddressRequest> addresses;
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
    if(req.getName() != null) c.setName(req.getName());
    if(req.getEmail() != null) c.setEmail(req.getEmail());
    if(req.getPhone() != null)     c.setPhone(Strings.isBlank(req.getPhone()) ? "":req.getPhone().trim());
    if(req.getType() != null) c.setType(req.getType());
    if(req.getStatus() != null) c.setStatus(req.getStatus());

    // Mettre à jour les adresses si fournies
    if (req.getAddresses() != null) {
      // Supprimer les anciennes adresses
      c.getAddresses().clear();
      // Ajouter les nouvelles adresses
      for (int i = 0; i < req.getAddresses().size(); i++) {
        AddressRequest addrReq = req.getAddresses().get(i);
        Adress adress = new Adress();
        adress.setStreet(addrReq.getStreet());
        adress.setCity(addrReq.getCity());
        adress.setPostalCode(addrReq.getPostalCode());
        adress.setAcces(addrReq.getAcces());
        adress.setOrder(addrReq.getOrder() != null ? addrReq.getOrder() : i);
        adress.setHasKey(Boolean.TRUE.equals(addrReq.getHasKey()));
        adress.setClient(c);
        c.getAddresses().add(adress);
      }
    }
    clientRepository.save(c);

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
