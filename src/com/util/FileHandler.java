package com.util;

import java.io.FileWriter;
import java.io.IOException;

public class FileHandler {

    public void writeToFile(String data) {

        try {

            FileWriter writer =
                    new FileWriter("reports.txt", true);

            writer.write(data + "\n");

            writer.close();

            System.out.println("Data Written To File Successfully");

        }
        catch (IOException e) {

            System.out.println("File Error: " + e.getMessage());
        }
    }
}