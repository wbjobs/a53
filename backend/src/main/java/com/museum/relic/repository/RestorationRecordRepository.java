package com.museum.relic.repository;

import com.museum.relic.entity.RestorationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RestorationRecordRepository extends JpaRepository<RestorationRecord, Long> {
    List<RestorationRecord> findByRelicIdOrderByRestorationDateDesc(Long relicId);
    List<RestorationRecord> findByRestorerIdOrderByRestorationDateDesc(Long restorerId);
}
