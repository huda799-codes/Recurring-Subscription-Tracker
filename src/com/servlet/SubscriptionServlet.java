package com.servlet;
import jakarta.servlet.http.HttpServlet;
import com.controller.SubscriptionController;
import com.model.Subscription;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/addSubscription")

public class SubscriptionServlet extends HttpServlet {

    protected void doPost(
            HttpServletRequest request,
            HttpServletResponse response
    ) throws ServletException, IOException {

        String serviceName =
                request.getParameter("serviceName");

        double amount =
                Double.parseDouble(
                        request.getParameter("amount")
                );

        String category =
                request.getParameter("category");

        String billingCycle =
                request.getParameter("billingCycle");

        String nextBillingDate =
                request.getParameter("nextBillingDate");

        Subscription subscription =
                new Subscription(serviceName, amount, category,billingCycle,nextBillingDate);

        SubscriptionController controller =
                new SubscriptionController();

        controller.addSubscription(subscription);

        response.sendRedirect("index.html");
    }
}
