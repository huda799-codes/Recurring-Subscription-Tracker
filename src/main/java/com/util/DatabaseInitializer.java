package com.util;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.Statement;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    @Override
    public void run(String... args) {

        try (
                Connection conn = DBConnection.getConnection();
                Statement stmt = conn.createStatement()
        ) {

            System.out.println("Checking/Initializing Database Tables...");

            stmt.execute(
                    "CREATE TABLE IF NOT EXISTS users (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY," +
                            "username VARCHAR(255) NOT NULL," +
                            "email VARCHAR(255) NOT NULL UNIQUE," +
                            "password VARCHAR(255) NOT NULL" +
                            ")"
            );

            stmt.execute(
                    "CREATE TABLE IF NOT EXISTS subscriptions (" +
                            "id INT AUTO_INCREMENT PRIMARY KEY," +
                            "service_name VARCHAR(255) NOT NULL," +
                            "amount DOUBLE NOT NULL," +
                            "category VARCHAR(255) NOT NULL," +
                            "billing_cycle VARCHAR(255) NOT NULL," +
                            "next_billing_date VARCHAR(255) NOT NULL," +
                            "user_id INT," +
                            "FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE" +
                            ")"
            );

            System.out.println("Database tables checked/created successfully.");

        } catch (Exception e) {
            System.out.println("Database initialization failed.");
            e.printStackTrace();
        }
    }
}