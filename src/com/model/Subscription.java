package com.model;
import com.model.Subscription;
public class Subscription {

    private String serviceName;
    private double amount;
    private String category;
    private String billingCycle;
    private String nextBillingDate;

    public Subscription(
            String serviceName,
            double amount,
            String category,
            String billingCycle,
            String nextBillingDate
    ) {

        this.serviceName = serviceName;
        this.amount = amount;
        this.category = category;
        this.billingCycle = billingCycle;
        this.nextBillingDate = nextBillingDate;
    }

    public String getServiceName() {
        return serviceName;
    }

    public void setServiceName(String serviceName) {
        this.serviceName = serviceName;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getBillingCycle() {
        return billingCycle;
    }

    public void setBillingCycle(String billingCycle) {
        this.billingCycle = billingCycle;
    }

    public String getNextBillingDate() {
        return nextBillingDate;
    }

    public void setNextBillingDate(String nextBillingDate) {
        this.nextBillingDate = nextBillingDate;
    }
}