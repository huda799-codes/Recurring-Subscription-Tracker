package com.controller;

import com.dao.UserDAO;
import com.model.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserDAO userDAO;

    public AuthController(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody User user) {

        Map<String, Object> response = new HashMap<>();

        if (user.getUsername() == null || user.getUsername().isBlank()
                || user.getEmail() == null || user.getEmail().isBlank()
                || user.getPassword() == null || user.getPassword().isBlank()) {

            response.put("success", false);
            response.put("message", "All fields are required.");

            return ResponseEntity.badRequest().body(response);
        }

        if (user.getPassword().length() < 6) {
            response.put("success", false);
            response.put("message", "Password must be at least 6 characters.");

            return ResponseEntity.badRequest().body(response);
        }

        String cleanEmail = user.getEmail().toLowerCase().trim();

        if (userDAO.emailExists(cleanEmail)) {
            response.put("success", false);
            response.put("message", "An account with this email already exists.");

            return ResponseEntity.badRequest().body(response);
        }

        user.setEmail(cleanEmail);

        boolean saved = userDAO.addUser(user);

        if (!saved) {
            response.put("success", false);
            response.put("message", "Registration failed. Please try again.");

            return ResponseEntity.internalServerError().body(response);
        }

        User createdUser = userDAO.findByEmail(cleanEmail);

        response.put("success", true);
        response.put("message", "Account created successfully.");
        response.put("userId", createdUser.getId());
        response.put("username", createdUser.getUsername());
        response.put("email", createdUser.getEmail());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> body) {

        Map<String, Object> response = new HashMap<>();

        String email = body.getOrDefault("email", "").toLowerCase().trim();
        String password = body.getOrDefault("password", "").trim();

        if (email.isBlank() || password.isBlank()) {
            response.put("success", false);
            response.put("message", "Email and password are required.");

            return ResponseEntity.badRequest().body(response);
        }

        User user = userDAO.findByEmail(email);

        if (user == null || !user.getPassword().equals(password)) {
            response.put("success", false);
            response.put("message", "Invalid email or password.");

            return ResponseEntity.status(401).body(response);
        }

        response.put("success", true);
        response.put("message", "Login successful.");
        response.put("userId", user.getId());
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());

        return ResponseEntity.ok(response);
    }
}