package com.topperformers.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.topperformers.dto.MarketQuote;
import com.topperformers.model.ActionEtf;
import com.topperformers.repository.ActionEtfRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Core business rule: the first time the UI is consulted on a new day, the
 * top 100 MTD performers are persisted with snapshot_date = today.
 * The operation is idempotent.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SnapshotService {

    private static final int SNAPSHOT_SIZE = 100;

    private final ActionEtfRepository repository;
    private final MarketDataService marketDataService;

    @Transactional
    public synchronized List<ActionEtf> getOrCreateTodaySnapshot() {
        LocalDate today = LocalDate.now();
        long count = repository.countBySnapshotDate(today);

        if (count >= SNAPSHOT_SIZE) {
            return repository.findBySnapshotDateOrderByRankAsc(today);
        }

        log.info("No complete snapshot for {} (found {}), fetching market data", today, count);
        return createSnapshot(today);
    }

    @Transactional
    public synchronized List<ActionEtf> forceSnapshot() {
        return createSnapshot(LocalDate.now());
    }

    @Transactional(readOnly = true)
    public List<ActionEtf> getSnapshot(LocalDate date) {
        return repository.findBySnapshotDateOrderByRankAsc(date);
    }

    @Transactional(readOnly = true)
    public List<ActionEtf> getHistory(String symbol) {
        return repository.findBySymbolIgnoreCaseOrderBySnapshotDateAsc(symbol);
    }

    private List<ActionEtf> createSnapshot(LocalDate date) {
        List<MarketQuote> quotes = marketDataService.fetchTop100();
        repository.deleteBySnapshotDate(date);

        List<ActionEtf> rows = new ArrayList<>(quotes.size());
        int rank = 1;
        for (MarketQuote q : quotes) {
            rows.add(ActionEtf.builder()
                    .snapshotDate(date)
                    .rank(rank++)
                    .symbol(q.symbol())
                    .name(q.name())
                    .type(q.type())
                    .priceNow(q.priceNow())
                    .priceMonthStart(q.priceMonthStart())
                    .performancePct(MarketDataService.performance(q))
                    .marketCap(q.marketCap())
                    .volume(q.volume())
                    .sector(q.sector())
                    .build());
        }

        List<ActionEtf> saved = repository.saveAll(rows);
        log.info("Snapshot {} persisted with {} rows", date, saved.size());
        return saved;
    }
}
