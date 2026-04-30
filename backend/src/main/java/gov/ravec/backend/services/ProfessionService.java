package gov.ravec.backend.services;

import gov.ravec.backend.entities.Profession;
import gov.ravec.backend.repositories.ProfessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProfessionService {

    private final ProfessionRepository professionRepository;

    public List<Profession> findAll() {
        return professionRepository.findAll();
    }

    public Optional<Profession> findByCode(Integer code) {
        return professionRepository.findById(code);
    }
}
