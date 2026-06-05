package com.controller;

import com.dao.SubscriptionDAO;
import com.model.Subscription;

public class SubscriptionController {

    private SubscriptionDAO dao;

    public SubscriptionController() {
        dao = new SubscriptionDAO();
    }

    // ADD SUBSCRIPTION
    public void addSubscription(
            String serviceName,
            double amount,
            String category,
            String billingCycle,
            String nextBillingDate
    ) {

        Subscription subscription = new Subscription(
                serviceName,
                amount,
                category,
                billingCycle,
                nextBillingDate
        );

        dao.addSubscription(subscription);
    }

    // OVERLOADED METHOD
    public void addSubscription(Subscription subscription) {
        dao.addSubscription(subscription);
    }

    // UPDATE SUBSCRIPTION
    public void updateSubscription(
            int id,
            String serviceName,
            double amount,
            String category,
            String billingCycle,
            String nextBillingDate
    ) {

        Subscription subscription = new Subscription();

        subscription.setId(id);
        subscription.setServiceName(serviceName);
        subscription.setAmount(amount);
        subscription.setCategory(category);
        subscription.setBillingCycle(billingCycle);
        subscription.setNextBillingDate(nextBillingDate);

        dao.updateSubscription(subscription);
    }

    // DELETE SUBSCRIPTION
    public void deleteSubscription(int id) {
        dao.deleteSubscription(id);
    }
}