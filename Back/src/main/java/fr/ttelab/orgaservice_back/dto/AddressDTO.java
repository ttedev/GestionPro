package fr.ttelab.orgaservice_back.dto;

import lombok.Data;

@Data
public class AddressDTO {
  private String id;
  private String street;
  private String city;
  private String postalCode;
  private String acces;
  private Integer order;
  private boolean hasKey;
}

