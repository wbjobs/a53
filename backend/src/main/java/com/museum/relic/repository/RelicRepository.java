package com.museum.relic.repository;

import com.museum.relic.entity.Relic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RelicRepository extends JpaRepository<Relic, Long> {
    Optional<Relic> findByRelicNo(String relicNo);
    boolean existsByRelicNo(String relicNo);
}
