package gov.ravec.backend.utils;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class Reference {
	private String regYear;
	private String regNumber;
	private	String regFolio;
	private	String actNumber;
}
