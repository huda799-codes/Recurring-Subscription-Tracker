package com.util;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class DateUtil {

    public long daysBetweenTodayAnd(String date) {

        LocalDate today =
                LocalDate.now();

        LocalDate billingDate =
                LocalDate.parse(date);

        return ChronoUnit.DAYS.between(today, billingDate);
    }
}