package gov.ravec.backend.utils;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class FactDate {
	private int day;
	private int month;
	private int year;
}
