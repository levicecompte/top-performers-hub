package com.topperformers.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Random;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.topperformers.dto.MarketQuote;

import lombok.extern.slf4j.Slf4j;
import reactor.core.publisher.Flux;

/**
 * Fetches the month-to-date performance of a universe of stocks and ETFs.
 *
 * Real provider: TwelveData time_series endpoint (MARKET_DATA_API_KEY).
 * Without an API key the service falls back to a deterministic smart mock so
 * the whole stack stays runnable locally.
 */
@Service
@Slf4j
public class MarketDataService {

    private static final DateTimeFormatter DATE = DateTimeFormatter.ISO_DATE;

    private final WebClient webClient;
    private final String apiKey;

    public MarketDataService(WebClient.Builder builder,
                             @Value("${market.base-url}") String baseUrl,
                             @Value("${market.api-key:}") String apiKey) {
        this.webClient = builder.baseUrl(baseUrl).build();
        this.apiKey = apiKey;
    }

    public boolean isLive() {
        return apiKey != null && !apiKey.isBlank();
    }

    /** Returns the 100 best MTD performers, already sorted desc by performance. */
    public List<MarketQuote> fetchTop100() {
        List<MarketQuote> quotes = isLive() ? fetchLive(Universe.SYMBOLS) : mock(Universe.SYMBOLS);

        return quotes.stream()
                .filter(q -> q.priceMonthStart() != null
                        && q.priceMonthStart().compareTo(BigDecimal.ZERO) > 0
                        && q.priceNow() != null)
                .sorted(Comparator.comparing(MarketDataService::performance).reversed())
                .limit(100)
                .toList();
    }

    public static BigDecimal performance(MarketQuote q) {
        return q.priceNow()
                .subtract(q.priceMonthStart())
                .divide(q.priceMonthStart(), 8, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100))
                .setScale(4, RoundingMode.HALF_UP);
    }

    // ---------------------------------------------------------------- live

    private List<MarketQuote> fetchLive(List<Universe.Entry> universe) {
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        LocalDate today = LocalDate.now();

        return Flux.fromIterable(universe)
                .flatMap(entry -> fetchOne(entry, monthStart, today), 8)
                .collectList()
                .onErrorResume(err -> {
                    log.error("Market data provider failed, falling back to mock", err);
                    return reactor.core.publisher.Mono.just(mock(universe));
                })
                .blockOptional()
                .orElseGet(() -> mock(universe));
    }

    @SuppressWarnings("unchecked")
    private reactor.core.publisher.Mono<MarketQuote> fetchOne(Universe.Entry entry,
                                                              LocalDate monthStart,
                                                              LocalDate today) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder.path("/time_series")
                        .queryParam("symbol", entry.symbol())
                        .queryParam("interval", "1day")
                        .queryParam("start_date", monthStart.format(DATE))
                        .queryParam("end_date", today.format(DATE))
                        .queryParam("apikey", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(Map.class)
                .map(body -> {
                    List<Map<String, String>> values = (List<Map<String, String>>) body.get("values");
                    if (values == null || values.isEmpty()) {
                        throw new IllegalStateException("No values for " + entry.symbol());
                    }
                    // TwelveData returns newest first.
                    Map<String, String> newest = values.get(0);
                    Map<String, String> oldest = values.get(values.size() - 1);
                    BigDecimal priceNow = new BigDecimal(newest.get("close"));
                    BigDecimal priceMonthStart = new BigDecimal(oldest.get("open"));
                    long volume = newest.get("volume") == null ? 0L : Long.parseLong(newest.get("volume"));
                    return new MarketQuote(entry.symbol(), entry.name(), entry.type(), entry.sector(),
                            priceNow, priceMonthStart, entry.marketCap(), volume);
                })
                .onErrorResume(err -> {
                    log.warn("Quote failed for {}: {}", entry.symbol(), err.getMessage());
                    return reactor.core.publisher.Mono.empty();
                });
    }

    // ---------------------------------------------------------------- mock

    /** Deterministic per (symbol, month) so a snapshot is stable within a day. */
    private List<MarketQuote> mock(List<Universe.Entry> universe) {
        LocalDate monthStart = LocalDate.now().withDayOfMonth(1);
        List<MarketQuote> out = new ArrayList<>(universe.size());

        for (Universe.Entry entry : universe) {
            Random rnd = new Random((entry.symbol() + monthStart).hashCode());
            BigDecimal base = BigDecimal.valueOf(8 + rnd.nextDouble() * 620)
                    .setScale(4, RoundingMode.HALF_UP);
            double perf = -12 + rnd.nextDouble() * 78; // -12% .. +66%
            BigDecimal now = base.multiply(BigDecimal.valueOf(1 + perf / 100))
                    .setScale(4, RoundingMode.HALF_UP);
            long volume = (long) (500_000 + rnd.nextDouble() * 95_000_000);
            out.add(new MarketQuote(entry.symbol(), entry.name(), entry.type(), entry.sector(),
                    now, base, entry.marketCap(), volume));
        }
        return out;
    }
}
