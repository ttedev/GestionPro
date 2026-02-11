package fr.ttelab.orgaservice_back.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class SupportMessageDTO {
  private String id;
  private String userId;
  private String userName;
  private String content;
  private boolean fromAdmin;
  private boolean readByUser;
  private boolean readByAdmin;
  private LocalDateTime createdAt;
}

