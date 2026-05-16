package com.subscriptiontracker;

import com.controller.SubscriptionController;
import com.model.Subscription;

import java.util.Scanner;

public class Main {

    public static void main(String[] args) {

        Scanner input = new Scanner(System.in);

        SubscriptionController controller =
                new SubscriptionController();

        System.out.println("=================================");
        System.out.println(" RECURRING SUBSCRIPTION TRACKER ");
        System.out.println("=================================");

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

        Subscription subscription =
                new Subscription(
                        serviceName,
                        amount,
                        category,
                        billingCycle,
                        nextBillingDate
                );

        controller.addSubscription(subscription);

        System.out.println();
        System.out.println("Subscription Saved Successfully!");
    }
}