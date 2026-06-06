package com.controller;

import com.services.NotificationService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reminders")
public class ReminderController {

    private final NotificationService notificationService;

    public ReminderController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/{serviceName}")
    public String getReminder(@PathVariable String serviceName) {
        return notificationService.sendReminder(serviceName);
    }
}