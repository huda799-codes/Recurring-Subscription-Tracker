package com.dao;

import com.model.User;
import org.springframework.stereotype.Repository;

@Repository
public class UserDAO {

    public void addUser(User user) {
        System.out.println("User saved: " + user.getUsername());
    }
}