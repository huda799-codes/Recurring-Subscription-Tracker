package com.services;

import com.dao.SubscriptionDAO;
import com.model.Subscription;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubscriptionService {

    private final SubscriptionDAO dao;

    public SubscriptionService(SubscriptionDAO dao) {
        this.dao = dao;
    }

    public void addSubscription(Subscription subscription) {
        dao.addSubscription(subscription);
    }

    public List<Subscription> getAllSubscriptions() {
        return dao.getAllSubscriptions();
    }

    public List<Subscription> getAllSubscriptions(int userId) {
        return dao.getAllSubscriptions(userId);
    }

    public void updateSubscription(Subscription subscription) {
        dao.updateSubscription(subscription);
    }

    public void deleteSubscription(int id) {
        dao.deleteSubscription(id);
    }
}