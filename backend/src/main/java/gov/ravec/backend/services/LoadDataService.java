package gov.ravec.backend.services;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import gov.ravec.backend.entities.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

@Service
public class LoadDataService {

    @Autowired
    private RoleService roleService;

    @Autowired
    private UserService userService;

    @Autowired
    private PermissionService permissionService;


    public void loadPermission() {
        ObjectMapper mapper = new ObjectMapper();
        TypeReference<List<Permission>> typeReference = new TypeReference<List<Permission>>() {};
        InputStream inputStream = TypeReference.class.getResourceAsStream("/json/permissions.json");
        try {
            List<Permission> permissions = mapper.readValue(inputStream, typeReference);
            if (permissionService.saveAll(permissions)){
                System.out.println("Permissions Saved!");
            }else System.out.println("Data permissions exists");
        } catch (IOException e) {
            System.out.println("Unable to save permissions: " + e.getMessage());
        }
    }

    public void loadRole() {
        ObjectMapper mapper = new ObjectMapper();
        TypeReference<List<Role>> typeReference = new TypeReference<List<Role>>() {
        };
        InputStream inputStream = TypeReference.class.getResourceAsStream("/json/roles.json");
        try {
            List<Role> roles = mapper.readValue(inputStream, typeReference);
            if (roleService.saveAll(roles)){
                System.out.println("Roles Saved!");
            }else {
                System.out.println("Data roles exists");
            }

        } catch (IOException e) {
            System.out.println("Unable to save Roles: " + e.getMessage());
        }
    }

    public void loadUser() {
        ObjectMapper mapper = new ObjectMapper();
        TypeReference<List<User>> typeReference = new TypeReference<List<User>>() {
        };
        InputStream inputStream = TypeReference.class.getResourceAsStream("/json/users.json");
        try {
            List<User> users = mapper.readValue(inputStream, typeReference);
            if (userService.saveAll(users)){
                System.out.println("Users Saved!");
            }else {
                System.out.println("Data users exists");
            }
        } catch (IOException e) {
            System.out.println("Unable to save Users: " + e.getMessage());
        }
    }

}
