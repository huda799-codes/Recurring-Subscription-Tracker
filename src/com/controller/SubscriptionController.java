package controller;

import dao.SubscriptionDAO;
import model.Subscription;

public class SubscriptionController {

    SubscriptionDAO dao = new SubscriptionDAO();

    public void addSubscription(
            int id,
            String name,
            double amount,
            String category,
            String billingCycle,
            String nextBillingDate
    ) {

        Subscription subscription =
                new Subscription(
                        id,
                        name,
                        amount,
                        category,
                        billingCycle,
                        nextBillingDate
                );

        dao.addSubscription(subscription);
    }

    public void addSubscription(String netflix, double v, String entertainment, String monthly, String date) {
    }
}
