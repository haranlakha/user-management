package org.example.controller;

import org.example.entity.Admin;
import org.example.entity.User;
import org.example.utility.Utility;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    // --- Login DTO ---
    public static class LoginRequest {
        private String usernameOrEmail;
        private String password;

        public String getUsernameOrEmail() {
            return usernameOrEmail;
        }

        public void setUsernameOrEmail(String usernameOrEmail) {
            this.usernameOrEmail = usernameOrEmail;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }

    // --- Registration DTO with confirmPassword ---
    public static class RegisterRequest {
        private String role; // "ADMIN" or "USER"
        private String username; // For Admin
        private String name;     // For User
        private String email;    // For User
        private Integer age;     // For User
        private String password;
        private String confirmPassword;

        public String getRole() {
            return role;
        }

        public void setRole(String role) {
            this.role = role;
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public Integer getAge() {
            return age;
        }

        public void setAge(Integer age) {
            this.age = age;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getConfirmPassword() {
            return confirmPassword;
        }

        public void setConfirmPassword(String confirmPassword) {
            this.confirmPassword = confirmPassword;
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String identifier = request.getUsernameOrEmail() != null ? request.getUsernameOrEmail().trim() : "";
        String password = request.getPassword() != null ? request.getPassword().trim() : "";

        // 1. Try Admin authentication first
        if (!password.isEmpty()) {
            Admin admin = Utility.authenticateAdmin(identifier, password);
            if (admin != null) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("role", "ADMIN");
                response.put("user", Map.of("id", admin.getId(), "username", admin.getUsername()));
                return ResponseEntity.ok(response);
            }
        }

        // 2. Try Standard User authentication with password
        User user = Utility.authenticateUser(identifier, password);
        if (user != null) {
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("role", "USER");
            response.put("user", user);
            return ResponseEntity.ok(response);
        }

        // 3. Fallback: Neither admin nor user matched
        Map<String, Object> error = new HashMap<>();
        error.put("success", false);
        error.put("message", "Invalid credentials. Please verify your username/email and password.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Validate password confirmation
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            response.put("success", false);
            response.put("message", "Password cannot be empty.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            response.put("success", false);
            response.put("message", "Passwords do not match. Please re-enter.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // 1. Register Admin
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            String username = request.getUsername() != null ? request.getUsername().trim() : "";
            if (username.isEmpty()) {
                response.put("success", false);
                response.put("message", "Admin username is required.");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
            }
            if (Utility.isAdminUsernameTaken(username)) {
                response.put("success", false);
                response.put("message", "Admin username '" + username + "' is already taken.");
                return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
            }

            Admin newAdmin = new Admin();
            newAdmin.setUsername(username);
            newAdmin.setPassword(request.getPassword().trim());
            Utility.createAdmin(newAdmin);

            response.put("success", true);
            response.put("role", "ADMIN");
            response.put("user", Map.of("id", newAdmin.getId(), "username", newAdmin.getUsername()));
            return ResponseEntity.ok(response);
        }

        // 2. Register Standard User
        String email = request.getEmail() != null ? request.getEmail().trim() : "";
        String name = request.getName() != null ? request.getName().trim() : "";
        Integer age = request.getAge();

        if (email.isEmpty() || name.isEmpty() || age == null) {
            response.put("success", false);
            response.put("message", "Full Name, Email, and Age are required for user registration.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        if (Utility.isUserEmailTaken(email)) {
            response.put("success", false);
            response.put("message", "An account with email '" + email + "' already exists.");
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }

        User newUser = new User();
        newUser.setName(name);
        newUser.setEmail(email);
        newUser.setAge(age);
        newUser.setPassword(request.getPassword().trim()); // Encrypted transparently by @Convert
        Utility.createUser(newUser);

        response.put("success", true);
        response.put("role", "USER");
        response.put("user", newUser);
        return ResponseEntity.ok(response);
    }
}
