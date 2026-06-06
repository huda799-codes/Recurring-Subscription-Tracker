package com.model;

public class Subscription {

    private int    id;
    private String serviceName;
    private double amount;
    private String category;
    private String billingCycle;
    private String nextBillingDate;
    private int    userId;
    public Subscription() {}

    public Subscription(String serviceName,
                        double amount,
                        String category,
                        String billingCycle,
                        String nextBillingDate,
                        int userId) {
        this.serviceName      = serviceName;
        this.amount           = amount;
        this.category         = category;
        this.billingCycle     = billingCycle;
        this.nextBillingDate  = nextBillingDate;
        this.userId           = userId;
    }

    public Subscription(int id,
                        String serviceName,
                        double amount,
                        String category,
                        String billingCycle,
                        String nextBillingDate,
                        int userId) {
        this.id               = id;
        this.serviceName      = serviceName;
        this.amount           = amount;
        this.category         = category;
        this.billingCycle     = billingCycle;
        this.nextBillingDate  = nextBillingDate;
        this.userId           = userId;
    }

    /* ── Getters & Setters ────────────────────────────────────────── */
    public int getId()                         { return id; }
    public void setId(int id)                  { this.id = id; }

    public String getServiceName()             { return serviceName; }
    public void setServiceName(String v)       { this.serviceName = v; }

    public double getAmount()                  { return amount; }
    public void setAmount(double v)            { this.amount = v; }

    public String getCategory()                { return category; }
    public void setCategory(String v)          { this.category = v; }

    public String getBillingCycle()            { return billingCycle; }
    public void setBillingCycle(String v)      { this.billingCycle = v; }

    public String getNextBillingDate()         { return nextBillingDate; }
    public void setNextBillingDate(String v)   { this.nextBillingDate = v; }

    public int getUserId()                     { return userId; }
    public void setUserId(int v)               { this.userId = v; }
}