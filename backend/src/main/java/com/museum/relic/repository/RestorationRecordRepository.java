package com.museum.relic.repository;

import com.museum.relic.entity.RestorationRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RestorationRecordRepository extends JpaRepository<RestorationRecord, Long> {

    @Query("SELECT DISTINCT r FROM RestorationRecord r " +
           "JOIN FETCH r.relic " +
           "JOIN FETCH r.restorer " +
           "LEFT JOIN FETCH r.processPhotos " +
           "WHERE r.relic.id = :relicId " +
           "ORDER BY r.restorationDate DESC")
    List<RestorationRecord> findByRelicIdWithFetch(@Param("relicId") Long relicId);

    @Query("SELECT r FROM RestorationRecord r " +
           "JOIN FETCH r.relic " +
           "JOIN FETCH r.restorer " +
           "WHERE r.restorer.id = :restorerId " +
           "ORDER BY r.restorationDate DESC")
    List<RestorationRecord> findByRestorerIdWithFetch(@Param("restorerId") Long restorerId);

    @Query("SELECT r FROM RestorationRecord r " +
           "JOIN FETCH r.relic " +
           "JOIN FETCH r.restorer " +
           "ORDER BY r.restorationDate DESC")
    List<RestorationRecord> findAllWithFetch();

    @Query(value = "SELECT r FROM RestorationRecord r " +
           "JOIN FETCH r.relic " +
           "JOIN FETCH r.restorer",
           countQuery = "SELECT COUNT(r) FROM RestorationRecord r")
    Page<RestorationRecord> findAllWithFetchPageable(Pageable pageable);

    @Query("SELECT r FROM RestorationRecord r " +
           "JOIN FETCH r.relic " +
           "JOIN FETCH r.restorer " +
           "LEFT JOIN FETCH r.processPhotos " +
           "WHERE r.id = :id")
    Optional<RestorationRecord> findByIdWithPhotos(@Param("id") Long id);
}
