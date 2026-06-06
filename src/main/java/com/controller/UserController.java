package com.controller;

import com.dao.UserDAO;
import com.model.User;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserDAO userDAO;

    public UserController(UserDAO userDAO) {
        this.userDAO = userDAO;
    }

    @PostMapping
    public String addUser(@RequestBody User user) {

        userDAO.addUser(user);

        return "User Added Successfully";
    }
}