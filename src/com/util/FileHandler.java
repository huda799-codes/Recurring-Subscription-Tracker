package com.util;

import com.model.Subscription;

import java.io.FileWriter;
import java.io.IOException;

public class FileHandler {

    public static void saveToFile(Subscription s) {

        try {

            FileWriter writer =
                    new FileWriter("backups/subscriptions.txt", true);

            writer.write(
                    s.getServiceName() + "," +
                            s.getAmount() + "," +
                            s.getCategory() + "," +
                            s.getBillingCycle() + "," +
                            s.getNextBillingDate()
                            + "\n"
            );

            writer.close();

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}