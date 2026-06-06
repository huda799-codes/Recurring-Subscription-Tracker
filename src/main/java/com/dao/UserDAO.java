package com.dao;

import com.model.User;
import com.util.DBConnection;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

@Repository
public class UserDAO {

    /**
     * Insert a new user into the users table.
     * The SQL table must exist — run the schema below once in MySQL Workbench:
     *
     * CREATE TABLE IF NOT EXISTS users (
     *   id       INT AUTO_INCREMENT PRIMARY KEY,
     *   username VARCHAR(100) NOT NULL,
     *   email    VARCHAR(150) NOT NULL UNIQUE,
     *   password VARCHAR(255) NOT NULL
     * );
     */
    public boolean addUser(User user) {
        try {
            Connection connection = DBConnection.getConnection();

            String query =
                    "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";

            PreparedStatement ps = connection.prepareStatement(query);
            ps.setString(1, user.getUsername());
            ps.setString(2, user.getEmail());
            ps.setString(3, user.getPassword());

            ps.executeUpdate();
            connection.close();

            System.out.println("User registered: " + user.getEmail());
            return true;

        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Find a user by email (used during login).
     */
    public User findByEmail(String email) {
        try {
            Connection connection = DBConnection.getConnection();

            String query = "SELECT * FROM users WHERE email = ?";

            PreparedStatement ps = connection.prepareStatement(query);
            ps.setString(1, email);

            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                User user = new User();
                user.setId(rs.getInt("id"));
                user.setUsername(rs.getString("username"));
                user.setEmail(rs.getString("email"));
                user.setPassword(rs.getString("password"));
                connection.close();
                return user;
            }

            connection.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    /**
     * Check if an email is already registered.
     */
    public boolean emailExists(String email) {
        return findByEmail(email) != null;
    }
}