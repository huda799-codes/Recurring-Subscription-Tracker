package com.util;

public class ValidationUtil {

    public boolean isEmpty(String value) {
        return value == null || value.trim().isEmpty();
    }

    public boolean isPositiveAmount(double amount) {
        return amount > 0;
    }
}