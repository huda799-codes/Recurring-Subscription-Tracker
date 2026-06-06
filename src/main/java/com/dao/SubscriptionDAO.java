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

    /* ── Helper: map ResultSet row → Subscription object ─────────── */
    private Subscription mapRow(ResultSet rs) throws Exception {
        Subscription s = new Subscription();
        s.setId(rs.getInt("id"));
        s.setServiceName(rs.getString("service_name"));
        s.setAmount(rs.getDouble("amount"));
        s.setCategory(rs.getString("category"));
        s.setBillingCycle(rs.getString("billing_cycle"));
        s.setNextBillingDate(rs.getString("next_billing_date"));
        s.setUserId(rs.getInt("user_id"));
        return s;
    }

    /* ── INSERT ───────────────────────────────────────────────────── */
    public void addSubscription(Subscription subscription) {
        try {
            Connection connection = DBConnection.getConnection();

            String query =
                "INSERT INTO subscriptions " +
                "(service_name, amount, category, billing_cycle, next_billing_date, user_id) " +
                "VALUES (?, ?, ?, ?, ?, ?)";

            PreparedStatement ps = connection.prepareStatement(query);
            ps.setString(1, subscription.getServiceName());
            ps.setDouble(2, subscription.getAmount());
            ps.setString(3, subscription.getCategory());
            ps.setString(4, subscription.getBillingCycle());
            ps.setString(5, subscription.getNextBillingDate());
            ps.setInt(6, subscription.getUserId());

            ps.executeUpdate();
            connection.close();

            System.out.println("Subscription saved for userId=" + subscription.getUserId());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* ── SELECT ALL for a specific user ──────────────────────────── */
    public List<Subscription> getAllSubscriptions(int userId) {
        List<Subscription> list = new ArrayList<>();

        try {
            Connection connection = DBConnection.getConnection();

            String query = "SELECT * FROM subscriptions WHERE user_id = ? ORDER BY id DESC";

            PreparedStatement ps = connection.prepareStatement(query);
            ps.setInt(1, userId);

            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                list.add(mapRow(rs));
            }

            connection.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    /* ── SELECT ALL (no filter — kept for backward compat) ────────── */
    public List<Subscription> getAllSubscriptions() {
        List<Subscription> list = new ArrayList<>();

        try {
            Connection connection = DBConnection.getConnection();
            PreparedStatement ps = connection.prepareStatement("SELECT * FROM subscriptions ORDER BY id DESC");
            ResultSet rs = ps.executeQuery();

            while (rs.next()) {
                list.add(mapRow(rs));
            }

            connection.close();

        } catch (Exception e) {
            e.printStackTrace();
        }

        return list;
    }

    /* ── UPDATE ───────────────────────────────────────────────────── */
    public void updateSubscription(Subscription subscription) {
        try {
            Connection connection = DBConnection.getConnection();

            String query =
                "UPDATE subscriptions " +
                "SET service_name=?, amount=?, category=?, billing_cycle=?, next_billing_date=? " +
                "WHERE id=? AND user_id=?";

            PreparedStatement ps = connection.prepareStatement(query);
            ps.setString(1, subscription.getServiceName());
            ps.setDouble(2, subscription.getAmount());
            ps.setString(3, subscription.getCategory());
            ps.setString(4, subscription.getBillingCycle());
            ps.setString(5, subscription.getNextBillingDate());
            ps.setInt(6, subscription.getId());
            ps.setInt(7, subscription.getUserId());

            int rows = ps.executeUpdate();
            System.out.println("Rows Updated = " + rows);

            connection.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    /* ── DELETE ───────────────────────────────────────────────────── */
    public void deleteSubscription(int id) {
        try {
            Connection connection = DBConnection.getConnection();

            PreparedStatement ps =
                connection.prepareStatement("DELETE FROM subscriptions WHERE id=?");
            ps.setInt(1, id);

            int rows = ps.executeUpdate();
            System.out.println("Rows Deleted = " + rows);

            connection.close();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}