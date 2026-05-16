package com.dao;

import com.model.Subscription;
import com.util.DBConnection;

import java.sql.Connection;
import java.sql.PreparedStatement;

public class SubscriptionDAO {

    public void addSubscription(Subscription subscription) {

        try {

            Connection connection =
                    DBConnection.getConnection();

            String query =
                    "INSERT INTO subscriptions(service_name, amount, category, billing_cycle, next_billing_date) VALUES (?, ?, ?, ?, ?)";

            PreparedStatement ps =
                    connection.prepareStatement(query);

            ps.setString(1,
                    subscription.getServiceName());

            ps.setDouble(2,
                    subscription.getAmount());

            ps.setString(3,
                    subscription.getCategory());

            ps.setString(4,
                    subscription.getBillingCycle());

            ps.setString(5,
                    subscription.getNextBillingDate());

            ps.executeUpdate();

            connection.close();

        } catch (Exception e) {

            e.printStackTrace();
        }
    }
}