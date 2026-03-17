package gov.ravec.backend.utils;

import lombok.*;


@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@ToString
@Builder
public class BirthDate {
	int day;
	int month;
	int year;
}
