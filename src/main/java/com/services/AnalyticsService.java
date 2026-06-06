package com.services;

import com.model.Subscription;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AnalyticsService {

    public double calculateMonthlyCost(List<Subscription> subscriptions) {

        double total = 0;

        for (Subscription subscription : subscriptions) {

            if ("Monthly".equalsIgnoreCase(subscription.getBillingCycle())) {
                total += subscription.getAmount();
            }
        }

        return total;
    }

    public double calculateYearlyCost(List<Subscription> subscriptions) {

        double total = 0;

        for (Subscription subscription : subscriptions) {

            if ("Yearly".equalsIgnoreCase(subscription.getBillingCycle())) {
                total += subscription.getAmount();
            }
        }

        return total;
    }

    public double calculateAnnualCost(List<Subscription> subscriptions) {

        double monthly =
                calculateMonthlyCost(subscriptions);

        double yearly =
                calculateYearlyCost(subscriptions);

        return (monthly * 12) + yearly;
    }
}