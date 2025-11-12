package fr.ttelab.orgaservice_back.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
public class RemarkDTO {
  private String id;
  private String clientId;
  private String content;
  private List<String> images;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
