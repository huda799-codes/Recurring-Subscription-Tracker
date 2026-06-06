package com.dao;

import com.model.PaymentHistory;
import org.springframework.stereotype.Repository;

@Repository
public class PaymentDAO {

    public void savePayment(PaymentHistory paymentHistory) {
        System.out.println("Payment Saved Successfully");
    }
}