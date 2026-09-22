package com.topperformers.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.topperformers.model.ActionEtf;
import com.topperformers.service.SnapshotService;

import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TopPerformersController {

    private final SnapshotService snapshotService;

    /** Today's top 100 (creates the daily snapshot on first consultation), or a past date. */
    @GetMapping("/top-performers")
    public List<ActionEtf> topPerformers(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null || date.isEqual(LocalDate.now())) {
            return snapshotService.getOrCreateTodaySnapshot();
        }
        return snapshotService.getSnapshot(date);
    }

    /** Evolution of one symbol across every stored snapshot_date. */
    @GetMapping("/top-performers/history")
    public List<ActionEtf> history(@RequestParam @NotBlank String symbol) {
        return snapshotService.getHistory(symbol);
    }

    /** Debug: force a new fetch + overwrite today's snapshot. */
    @PostMapping("/snapshot/force")
    public List<ActionEtf> force() {
        return snapshotService.forceSnapshot();
    }
}
