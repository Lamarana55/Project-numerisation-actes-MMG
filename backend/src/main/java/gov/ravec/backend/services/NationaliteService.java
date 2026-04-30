package gov.ravec.backend.services;

import gov.ravec.backend.entities.Nationalite;
import gov.ravec.backend.repositories.NationaliteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NationaliteService {

    private final NationaliteRepository nationaliteRepository;

    public List<Nationalite> findAll() {
        return nationaliteRepository.findAll();
    }

    public Optional<Nationalite> findByCode(String code) {
        return nationaliteRepository.findById(code.trim().toUpperCase());
    }
}
