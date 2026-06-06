package com.services;

import com.model.Subscription;
import org.springframework.stereotype.Service;

@Service
public class ReportService {

    public String generateSubscriptionReport(Subscription subscription) {

        return "Subscription Report: " +
                subscription.getServiceName() +
                " | " +
                subscription.getAmount() +
                " | " +
                subscription.getBillingCycle();
    }
}