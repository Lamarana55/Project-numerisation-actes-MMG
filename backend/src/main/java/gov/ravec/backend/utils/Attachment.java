package gov.ravec.backend.utils;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
@Embeddable
public class Attachment {
    private String extension;
  //  @ElementCollection
    @Lob
    @Basic(fetch = FetchType.LAZY)
    private String file; //Base64 encoded  file in String
    private String attachmentType;
}
