package fr.ttelab.orgaservice_back.controller;

import fr.ttelab.orgaservice_back.dto.RemarkDTO;
import fr.ttelab.orgaservice_back.entity.Client;
import fr.ttelab.orgaservice_back.entity.Remark;
import fr.ttelab.orgaservice_back.repository.ClientRepository;
import fr.ttelab.orgaservice_back.repository.RemarkRepository;
import fr.ttelab.orgaservice_back.util.MappingUtil;
import fr.ttelab.orgaservice_back.util.SecurityUtil;
import jakarta.transaction.Transactional;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.io.IOException;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin("*")
@PreAuthorize("hasRole('ACTIVE')")
public class RemarksController {
  private final RemarkRepository remarkRepository;
  private final ClientRepository clientRepository;
  private final SecurityUtil securityUtil;

  @GetMapping("/clients/{clientId}/remarks")
  public ResponseEntity<?> list(@PathVariable String clientId){
    var owner = securityUtil.getCurrentUser();
    Client client = clientRepository.findById(UUID.fromString(clientId)).filter(c -> c.getOwner().equals(owner)).orElse(null);
    if(client==null) return ResponseEntity.status(404).body(error("Client not found"));
    List<RemarkDTO> remarks = remarkRepository.findByClient_IdAndOwner_Id(UUID.fromString(clientId), owner.getId()).stream().map(MappingUtil::toRemarkDTO).toList();
    return ResponseEntity.ok(remarks);
  }

  @Data
  public static class RemarkCreateRequest {
    private String content;
    private List<String> images;
  }

  @PostMapping("/clients/{clientId}/remarks")
  @Transactional
  public ResponseEntity<?> create(@PathVariable String clientId, @RequestBody RemarkCreateRequest req){
    if((req.getContent()==null || req.getContent().isBlank()) && (req.getImages()==null || req.getImages().isEmpty())){
      return ResponseEntity.badRequest().body(error("Content or images required"));
    }
    var owner = securityUtil.getCurrentUser();
    Client client = clientRepository.findById(UUID.fromString(clientId)).filter(c -> c.getOwner().equals(owner)).orElse(null);
    if(client==null) return ResponseEntity.status(404).body(error("Client not found"));
    Remark r = new Remark();
    r.setClient(client);
    r.setOwner(owner);
    r.setContent(req.getContent());
    r.setImages(req.getImages());
    remarkRepository.save(r);
    return ResponseEntity.created(URI.create("/api/clients/"+clientId+"/remarks/"+r.getId())).body(MappingUtil.toRemarkDTO(r));
  }

  @Data
  public static class RemarkUpdateRequest {
    private String content;
    private List<String> images;
  }

  @PutMapping("/remarks/{id}")
  @Transactional
  public ResponseEntity<?> update(@PathVariable String id, @RequestBody RemarkUpdateRequest req){
    var owner = securityUtil.getCurrentUser();
    Optional<Remark> opt = remarkRepository.findById(UUID.fromString(id)).filter(r -> r.getOwner().equals(owner));
    if(opt.isEmpty()) return ResponseEntity.status(404).body(error("Remark not found"));
    Remark r = opt.get();
    r.setContent(req.getContent());
    r.setImages(req.getImages());
    return ResponseEntity.ok(MappingUtil.toRemarkDTO(r));
  }

  @DeleteMapping("/remarks/{id}")
  @Transactional
  public ResponseEntity<?> delete(@PathVariable String id){
    var owner = securityUtil.getCurrentUser();
    Optional<Remark> opt = remarkRepository.findById(UUID.fromString(id)).filter(r -> r.getOwner().equals(owner));
    if(opt.isEmpty()) return ResponseEntity.status(404).build();
    remarkRepository.delete(opt.get());
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/remarks/upload-image")
  public ResponseEntity<?> uploadImage(@RequestParam("image") MultipartFile file) throws IOException {
    // Stub: in real implementation store file and return URL
    String fakeUrl = "data:"+file.getContentType()+";base64,"+java.util.Base64.getEncoder().encodeToString(file.getBytes());
    return ResponseEntity.status(201).body(new ImageUploadResponse(fakeUrl));
  }

  private record ImageUploadResponse(String imageUrl) {}
  private static record ErrorResponse(String error, String details) {}
  private ErrorResponse error(String details){ return new ErrorResponse("Invalid request", details); }
}
