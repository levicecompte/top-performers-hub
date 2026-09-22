package com.topperformers.controller;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.topperformers.repository.ActionEtfRepository;
import com.topperformers.service.MarketDataService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class HealthController {

    private final ActionEtfRepository repository;
    private final MarketDataService marketDataService;

    @GetMapping("/health")
    public Map<String, Object> health() {
        LocalDate today = LocalDate.now();
        return Map.of(
                "status", "UP",
                "today", today.toString(),
                "todaySnapshotRows", repository.countBySnapshotDate(today),
                "latestSnapshot", repository.findLatestSnapshotDate().map(LocalDate::toString).orElse("none"),
                "marketDataMode", marketDataService.isLive() ? "LIVE" : "MOCK");
    }
}
