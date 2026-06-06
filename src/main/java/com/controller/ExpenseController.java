package com.controller;

import com.model.Subscription;
import com.services.AnalyticsService;
import com.services.SubscriptionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/expenses")
public class ExpenseController {

    private final SubscriptionService subscriptionService;
    private final AnalyticsService analyticsService;

    public ExpenseController(SubscriptionService subscriptionService,
                             AnalyticsService analyticsService) {

        this.subscriptionService = subscriptionService;
        this.analyticsService = analyticsService;
    }

    @GetMapping("/annual")
    public double getAnnualExpense() {

        List<Subscription> subscriptions =
                subscriptionService.getAllSubscriptions();

        return analyticsService.calculateAnnualCost(subscriptions);
    }

    @GetMapping("/monthly")
    public double getMonthlyExpense() {

        List<Subscription> subscriptions =
                subscriptionService.getAllSubscriptions();

        return analyticsService.calculateMonthlyCost(subscriptions);
    }

    @GetMapping("/yearly")
    public double getYearlyExpense() {

        List<Subscription> subscriptions =
                subscriptionService.getAllSubscriptions();

        return analyticsService.calculateYearlyCost(subscriptions);
    }
}