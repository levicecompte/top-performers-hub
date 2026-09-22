package com.topperformers.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.topperformers.model.ActionEtf;

@Repository
public interface ActionEtfRepository extends JpaRepository<ActionEtf, Long> {

    long countBySnapshotDate(LocalDate snapshotDate);

    List<ActionEtf> findBySnapshotDateOrderByRankAsc(LocalDate snapshotDate);

    List<ActionEtf> findBySymbolIgnoreCaseOrderBySnapshotDateAsc(String symbol);

    void deleteBySnapshotDate(LocalDate snapshotDate);

    @Query("select max(a.snapshotDate) from ActionEtf a")
    Optional<LocalDate> findLatestSnapshotDate();
}
