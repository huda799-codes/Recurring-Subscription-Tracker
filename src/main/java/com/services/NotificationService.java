package com.services;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public String sendReminder(String serviceName) {
        return "Reminder generated for " + serviceName;
    }
}