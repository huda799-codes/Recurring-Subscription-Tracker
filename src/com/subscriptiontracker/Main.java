package com.subscriptiontracker;

import com.controller.SubscriptionController;
import com.controller.FileController;

import java.util.Scanner;

public class Main {

    public static void main(String[] args) {

        Scanner input = new Scanner(System.in);

        SubscriptionController subscriptionController =
                new SubscriptionController();

        FileController fileController =
                new FileController();

        System.out.println("========================================");
        System.out.println("   RECURRING SUBSCRIPTION TRACKER");
        System.out.println("========================================");

        System.out.print("Enter Service Name: ");
        String serviceName = input.nextLine();

        System.out.print("Enter Amount: ");
        double amount = input.nextDouble();

        input.nextLine();

        System.out.print("Enter Category: ");
        String category = input.nextLine();

        System.out.print("Enter Billing Cycle (Monthly/Yearly): ");
        String billingCycle = input.nextLine();

        System.out.print("Enter Next Billing Date (YYYY-MM-DD): ");
        String nextBillingDate = input.nextLine();

        subscriptionController.addSubscription(
                serviceName,
                amount,
                category,
                billingCycle,
                nextBillingDate
        );

        String report =
                "Subscription Added -> " +
                        serviceName +
                        " | " +
                        amount +
                        " | " +
                        category;

        fileController.saveReport(report);

        System.out.println();
        System.out.println("========================================");
        System.out.println(" Subscription Saved Successfully!");
        System.out.println(" Data Stored In MySQL Database");
        System.out.println(" Report Stored In reports.txt");
        System.out.println("========================================");

        input.close();
    }
}