package com.museum.relic.repository;

import com.museum.relic.entity.RestorationPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface RestorationPhotoRepository extends JpaRepository<RestorationPhoto, Long> {

    @Query("SELECT p FROM RestorationPhoto p WHERE p.record.id = :recordId ORDER BY p.sortOrder ASC")
    List<RestorationPhoto> findByRecordIdOrderBySortOrderAsc(@Param("recordId") Long recordId);
}
