package com.dao;

import com.model.Subscription;
import com.util.DBConnection;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.List;

@Repository
public class SubscriptionDAO {

    public void addSubscription(Subscription subscription) {

        try {

            Connection connection =
                    DBConnection.getConnection();

            String query =
                    "INSERT INTO subscriptions(service_name, amount, category, billing_cycle, next_billing_date) " +
                            "VALUES (?, ?, ?, ?, ?)";

            PreparedStatement ps =
                    connection.prepareStatement(query);

            ps.setString(1, subscription.getServiceName());
            ps.setDouble(2, subscription.getAmount());
            ps.setString(3, subscription.getCategory());
            ps.setString(4, subscription.getBillingCycle());
            ps.setString(5, subscription.getNextBillingDate());

            ps.executeUpdate();

            connection.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<Subscription> getAllSubscriptions() {

        List<Subscription> list =
                new ArrayList<>();

        try {

            Connection connection =
                    DBConnection.getConnection();

            String query =
                    "SELECT * FROM subscriptions";

            PreparedStatement ps =
                    connection.prepareStatement(query);

            ResultSet rs =
                    ps.executeQuery();

            while (rs.next()) {

                Subscription subscription =
                        new Subscription();

                subscription.setId(rs.getInt("id"));
                subscription.setServiceName(rs.getString("service_name"));
                subscription.setAmount(rs.getDouble("amount"));
                subscription.setCategory(rs.getString("category"));
                subscription.setBillingCycle(rs.getString("billing_cycle"));
                subscription.setNextBillingDate(rs.getString("next_billing_date"));

                list.add(subscription);
            }

            connection.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    public void updateSubscription(Subscription subscription) {

        try {

            Connection connection =
                    DBConnection.getConnection();

            String query =
                    "UPDATE subscriptions " +
                            "SET service_name=?, amount=?, category=?, billing_cycle=?, next_billing_date=? " +
                            "WHERE id=?";

            PreparedStatement ps =
                    connection.prepareStatement(query);

            ps.setString(1, subscription.getServiceName());
            ps.setDouble(2, subscription.getAmount());
            ps.setString(3, subscription.getCategory());
            ps.setString(4, subscription.getBillingCycle());
            ps.setString(5, subscription.getNextBillingDate());
            ps.setInt(6, subscription.getId());

            int rows =
                    ps.executeUpdate();

            System.out.println("Rows Updated = " + rows);

            connection.close();

        } catch (Exception e) {
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

            int rows =
                    ps.executeUpdate();

            System.out.println("Rows Deleted = " + rows);

            connection.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}