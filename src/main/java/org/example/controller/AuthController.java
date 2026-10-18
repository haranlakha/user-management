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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String identifier = request.getUsernameOrEmail() != null ? request.getUsernameOrEmail().trim() : "";
        String password = request.getPassword() != null ? request.getPassword().trim() : "";

        // 1. If password is provided, try Admin authentication first
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

        // 2. Try Standard User authentication by email or name
        User user = Utility.authenticateUser(identifier);
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
        error.put("message", "Invalid credentials. Admin requires username and password. Standard users enter registered email.");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }
}
