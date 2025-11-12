package fr.ttelab.orgaservice_back.dto;

import fr.ttelab.orgaservice_back.entity.ClientStatus;
import fr.ttelab.orgaservice_back.entity.ClientType;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ClientDTO {
  private String id;
  private String name;
  private String email;
  private String phone;
  private String address;
  private String access;
  private Boolean hasKey;
  private ClientType type;
  private ClientStatus status;
  private LocalDateTime createdAt;
}
