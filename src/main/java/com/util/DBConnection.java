package com.util;

import java.sql.Connection;
import java.sql.DriverManager;

public class DBConnection {

    private static final String URL =
            "jdbc:mysql://localhost:3306/subscription_tracker" +
                    "?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true";

    private static final String USER = "root";

    // ⚠️ Use your actual MySQL password here
    private static final String PASSWORD = "ME@sql_1.8.2.1";

    public static Connection getConnection() {
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
            Connection connection = DriverManager.getConnection(URL, USER, PASSWORD);
            System.out.println("✅ Database Connected Successfully");
            return connection;
        } catch (Exception e) {
            System.out.println("❌ Database Connection Failed: " + e.getMessage());
            e.printStackTrace();
            return null;
        }
    }
}