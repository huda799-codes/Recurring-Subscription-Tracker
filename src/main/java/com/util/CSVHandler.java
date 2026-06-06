package com.util;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;

public class CSVHandler {

    public void writeCSV(String data) {

        try {

            File folder = new File("files");

            if (!folder.exists()) {
                folder.mkdir();
            }

            FileWriter writer =
                    new FileWriter("files/subscriptions.csv", true);

            writer.write(data + "\n");

            writer.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}