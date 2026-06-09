package com.controller;

import com.model.Subscription;
import com.services.SubscriptionService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/subscriptions")
@CrossOrigin(origins = "*")
public class SubscriptionController {

    private final SubscriptionService service;

    public SubscriptionController(SubscriptionService service) {
        this.service = service;
    }

    @PostMapping
    public String addSubscription(@RequestBody Subscription subscription) {

        System.out.println("ADD API CALLED");
        System.out.println("Name = " + subscription.getServiceName());

        service.addSubscription(subscription);

        return "Subscription Added Successfully";
    }

    @GetMapping
    public List<Subscription> getAllSubscriptions() {

        System.out.println("GET API CALLED");

        return service.getAllSubscriptions();
    }

    @PutMapping("/{id}")
    public String updateSubscription(@PathVariable int id,
                                     @RequestBody Subscription subscription) {

        System.out.println("UPDATE API CALLED");
        System.out.println("ID = " + id);

        subscription.setId(id);

        service.updateSubscription(subscription);

        return "Subscription Updated Successfully";
    }

    @DeleteMapping("/{id}")
    public String deleteSubscription(@PathVariable int id) {

        System.out.println("DELETE API CALLED");
        System.out.println("ID = " + id);

        service.deleteSubscription(id);

        return "Subscription Deleted Successfully";
    }
}