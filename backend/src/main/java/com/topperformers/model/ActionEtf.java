package com.topperformers.model;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "action_etf")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActionEtf {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    @Column(name = "rank", nullable = false)
    private Integer rank;

    @Column(name = "symbol", nullable = false, length = 20)
    private String symbol;

    @Column(name = "name")
    private String name;

    /** STOCK or ETF */
    @Column(name = "type", length = 10)
    private String type;

    @Column(name = "price_now", precision = 20, scale = 4)
    private BigDecimal priceNow;

    @Column(name = "price_month_start", precision = 20, scale = 4)
    private BigDecimal priceMonthStart;

    @Column(name = "performance_pct", precision = 10, scale = 4)
    private BigDecimal performancePct;

    @Column(name = "market_cap")
    private Long marketCap;

    @Column(name = "volume")
    private Long volume;

    @Column(name = "sector", length = 100)
    private String sector;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}
