package org.example.controller;

import org.example.dto.LoginRequest;
import org.example.dto.RegisterRequest;
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
public class AuthController {

    private static final int MIN_PASSWORD_LENGTH = 8;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        String identifier = request.getUsernameOrEmail() != null ? request.getUsernameOrEmail().trim() : "";
        // Passwords are used exactly as typed, spaces included
        String password = request.getPassword() != null ? request.getPassword() : "";

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

        // Admin accounts can't be self-registered; the default admin comes from postgresql.conf
        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            response.put("success", false);
            response.put("message", "Admin accounts cannot be created through registration.");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
        }

        // Validate password
        String password = request.getPassword();
        if (password == null || password.length() < MIN_PASSWORD_LENGTH) {
            response.put("success", false);
            response.put("message", "Password must be at least " + MIN_PASSWORD_LENGTH + " characters long.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
        if (!password.equals(request.getConfirmPassword())) {
            response.put("success", false);
            response.put("message", "Passwords do not match. Please re-enter.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        // Register Standard User
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
        newUser.setPassword(password); // Hashed with BCrypt by Utility.createUser
        try {
            Utility.createUser(newUser);
        } catch (RuntimeException e) {
            response.put("success", false);
            response.put("message", "Account could not be saved. Please try again later.");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }

        response.put("success", true);
        response.put("role", "USER");
        response.put("user", newUser);
        return ResponseEntity.ok(response);
    }
}
