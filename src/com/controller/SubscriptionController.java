package com.controller;

import com.dao.SubscriptionDAO;
import com.model.Subscription;

public class SubscriptionController {

    SubscriptionDAO dao = new SubscriptionDAO();

    public void addSubscription(String serviceName,
                                double amount,
                                String category,
                                String billingCycle,
                                String nextBillingDate) {

        Subscription subscription =
                new Subscription(
                        serviceName,
                        amount,
                        category,
                        billingCycle,
                        nextBillingDate
                );

        dao.addSubscription(subscription);
    }

    public void addSubscription(Subscription subscription) {

        dao.addSubscription(subscription);

    }
    public void updateSubscription(
            int id,
            String serviceName,
            double amount,
            String category,
            String billingCycle,
            String nextBillingDate
    ) {

        dao.updateSubscription(
                id,
                serviceName,
                amount,
                category,
                billingCycle,
                nextBillingDate
        );
    }
    public void deleteSubscription(int id) {

        dao.deleteSubscription(id);
    }
}