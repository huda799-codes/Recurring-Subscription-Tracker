package com.model;

public class PaymentHistory {

    private String serviceName;
    private double amount;

    public PaymentHistory(String serviceName, double amount) {
        this.serviceName = serviceName;
        this.amount = amount;
    }

    public String getServiceName() {
        return serviceName;
    }

    public double getAmount() {
        return amount;
    }
}