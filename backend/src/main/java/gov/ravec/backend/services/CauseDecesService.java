package gov.ravec.backend.services;

import gov.ravec.backend.entities.CauseDeces;
import gov.ravec.backend.repositories.CauseDecesRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CauseDecesService {

    private final CauseDecesRepository causeDecesRepository;

    public List<CauseDeces> findAll() {
        return causeDecesRepository.findAll();
    }
}
