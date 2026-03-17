package gov.ravec.backend.utils;

import lombok.Getter;

@Getter
public enum Role {
    ROLE_ADMIN("ROLE_ADMIN"),
    ROLE_POINT_FOCAL("ROLE_POINT_FOCAL"),
    ROLE_SURVEILLANT("ROLE_SURVEILLANT");

    private final String value;

    Role(String value) {
        this.value = value;
    }

}