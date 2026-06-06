package com.controller;

import com.model.Subscription;
import com.services.SubscriptionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subscriptions")
public class SubscriptionController {

    private final SubscriptionService service;

    public SubscriptionController(SubscriptionService service) {
        this.service = service;
    }

    @PostMapping
    public String addSubscription(@RequestBody Subscription subscription) {

        service.addSubscription(subscription);

        return "Subscription Added Successfully";
    }

    @GetMapping
    public List<Subscription> getAllSubscriptions() {
        return service.getAllSubscriptions();
    }

    @PutMapping("/{id}")
    public String updateSubscription(@PathVariable int id,
                                     @RequestBody Subscription subscription) {

        System.out.println("UPDATE METHOD CALLED");
        System.out.println("ID = " + id);

        subscription.setId(id);

        service.updateSubscription(subscription);

        return "Subscription Updated Successfully";
    }

    @DeleteMapping("/{id}")
    public String deleteSubscription(@PathVariable int id) {

        service.deleteSubscription(id);

        return "Subscription Deleted Successfully";
    }
}