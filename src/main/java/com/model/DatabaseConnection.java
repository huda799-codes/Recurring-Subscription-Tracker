package com.model;

import com.util.DBConnection;

import java.sql.Connection;

public class DatabaseConnection {

    public Connection connect() {
        return DBConnection.getConnection();
    }
}