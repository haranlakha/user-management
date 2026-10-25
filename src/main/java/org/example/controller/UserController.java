package org.example.controller;

import org.example.entity.User;
import org.example.utility.Utility;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000")
public class UserController {
    @GetMapping
    public List<User> getAllUsers() {
        // Return user list from Hibernate session
        return Utility.getAllUsers();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        Utility.createUser(user);
        return user;
    }

    @PutMapping("/{id}")
    public User updateUser(@PathVariable int id, @RequestBody User user) {
        Utility.updateUser(id, user.getName(), user.getEmail());
        return user;
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable int id) {
        Utility.deleteUser(id);
    }
}