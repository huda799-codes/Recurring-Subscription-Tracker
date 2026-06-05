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
    public void updateSubscription(
            int id,
            String serviceName,
            double amount,
            String category,
            String billingCycle,
            String nextBillingDate
    ) {

        try {

            Connection connection =
                    DBConnection.getConnection();

            String query =
                    "UPDATE subscriptions " +
                            "SET service_name=?, amount=?, category=?, " +
                            "billing_cycle=?, next_billing_date=? " +
                            "WHERE id=?";

            PreparedStatement ps =
                    connection.prepareStatement(query);

            ps.setString(1, serviceName);
            ps.setDouble(2, amount);
            ps.setString(3, category);
            ps.setString(4, billingCycle);
            ps.setString(5, nextBillingDate);
            ps.setInt(6, id);

            ps.executeUpdate();

            System.out.println("Subscription Updated");

        } catch (Exception e) {

            e.printStackTrace();
        }
    }
    public void updateSubscription(Subscription subscription) {

        try {

            Connection connection =
                    DBConnection.getConnection();

            String sql =
                    "UPDATE subscriptions " +
                            "SET service_name=?, amount=?, category=?, billing_cycle=?, next_billing_date=? " +
                            "WHERE id=?";

            PreparedStatement statement =
                    connection.prepareStatement(sql);

            statement.setString(
                    1,
                    subscription.getServiceName()
            );

            statement.setDouble(
                    2,
                    subscription.getAmount()
            );

            statement.setString(
                    3,
                    subscription.getCategory()
            );

            statement.setString(
                    4,
                    subscription.getBillingCycle()
            );

            statement.setString(
                    5,
                    subscription.getNextBillingDate()
            );

            statement.setInt(
                    6,
                    subscription.getId()
            );

            statement.executeUpdate();

            connection.close();

        }
        catch(Exception e) {

            e.printStackTrace();

        }
    }
    public void deleteSubscription(int id) {

        try {

            Connection connection =
                    DBConnection.getConnection();

            String query =
                    "DELETE FROM subscriptions WHERE id=?";

            PreparedStatement ps =
                    connection.prepareStatement(query);

            ps.setInt(1, id);

            ps.executeUpdate();

            System.out.println("Subscription Deleted");

        } catch (Exception e) {

            e.printStackTrace();
        }
    }
}