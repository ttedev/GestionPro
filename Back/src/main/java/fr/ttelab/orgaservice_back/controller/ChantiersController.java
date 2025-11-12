package fr.ttelab.orgaservice_back.controller;

import fr.ttelab.orgaservice_back.dto.ChantierDTO;

import fr.ttelab.orgaservice_back.repository.ChantierRepository;
import fr.ttelab.orgaservice_back.util.MappingUtil;
import fr.ttelab.orgaservice_back.util.SecurityUtil;
import lombok.AllArgsConstructor;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/chantiers")
@CrossOrigin("*")
@AllArgsConstructor
@PreAuthorize("hasRole('ACTIVE')")
public class ChantiersController {

    private  SecurityUtil securityUtil;
    private ChantierRepository chantierRepository;

    @GetMapping
    public List<ChantierDTO> list(@RequestParam(required = false) String clientId,@RequestParam(required = false) String projectId) {
        var owaner = securityUtil.getCurrentUser();
        if (projectId != null) {
            return chantierRepository.findByOwnerAndProject_Id(owaner, UUID.fromString(projectId)).stream().map(MappingUtil::toChantierDTO).collect(Collectors.toList());
        } else if (clientId != null) {
            return chantierRepository.findByOwnerAndClient_Id(owaner, UUID.fromString(clientId)).stream().map(MappingUtil::toChantierDTO).collect(Collectors.toList());
        }
        return  null;
    }

    @GetMapping("/{id}")
    public ChantierDTO getById(@PathVariable UUID id) {
        return chantierRepository.findById(id).map(MappingUtil::toChantierDTO).orElse(null);
    }


}

