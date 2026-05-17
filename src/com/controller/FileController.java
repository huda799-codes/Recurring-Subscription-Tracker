package com.controller;

import com.util.FileHandler;

public class FileController {

    FileHandler handler = new FileHandler();

    public void saveReport(String data) {
        handler.writeToFile(data);
    }
}