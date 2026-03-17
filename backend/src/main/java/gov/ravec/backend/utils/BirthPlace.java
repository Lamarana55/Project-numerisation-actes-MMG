package gov.ravec.backend.utils;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class BirthPlace {
    private String countryCode;
    private String placeCode;
    private String placeFree;
}
