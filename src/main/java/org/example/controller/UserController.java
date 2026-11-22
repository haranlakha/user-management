package org.example.controller;

import org.example.entity.User;
import org.example.security.SessionUser;
import org.example.utility.UserUtility;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    @GetMapping
    public List<User> getAllUsers() {
        // Return user list from Hibernate session
        return UserUtility.getAllUsers();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        UserUtility.createUser(user);
        return user;
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable int id, @RequestBody User user, @AuthenticationPrincipal SessionUser sessionUser) {

        if (!sessionUser.isAdmin() && sessionUser.getId() != id) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        UserUtility.updateUser(id, user.getName(), user.getEmail());
        return ResponseEntity.ok(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable int id) {
        UserUtility.deleteUser(id);
    }
}