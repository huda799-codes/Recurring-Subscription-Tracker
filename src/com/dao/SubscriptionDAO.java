package com.dao;

import com.model.Subscription;
import com.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;

public class SubscriptionDAO {

    public void addSubscription(Subscription subscription) {

        try {

            Connection con = DBConnection.getConnection();

            String query =
                    "INSERT INTO subscriptions(name, category, amount, billing_cycle, next_billing_date, status) VALUES (?, ?, ?, ?, ?, ?)";

            PreparedStatement ps = con.prepareStatement(query);

            ps.setString(1, subscription.getServiceName());
            ps.setString(2, subscription.getCategory());
            ps.setDouble(3, subscription.getAmount());
            ps.setString(4, subscription.getBillingCycle());
            ps.setString(5, subscription.getNextBillingDate());
            ps.setString(6, "ACTIVE");

            ps.executeUpdate();

            System.out.println("Subscription Added");

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}