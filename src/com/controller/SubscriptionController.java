package com.controller;

import com.dao.SubscriptionDAO;
import com.model.Subscription;

public class SubscriptionController {

    SubscriptionDAO dao = new SubscriptionDAO();

    public void addSubscription(Subscription subscription) {

        dao.addSubscription(subscription);
    }
}