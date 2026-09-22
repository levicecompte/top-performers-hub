package com.topperformers.dto;

import java.math.BigDecimal;

/** Normalized quote coming from the market data provider (or the mock). */
public record MarketQuote(
        String symbol,
        String name,
        String type,
        String sector,
        BigDecimal priceNow,
        BigDecimal priceMonthStart,
        Long marketCap,
        Long volume) {
}
