package com.museum.relic.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "restoration_records", indexes = {
        @Index(name = "idx_restorations_relic_date", columnList = "relic_id, restoration_date DESC"),
        @Index(name = "idx_restorations_restorer_date", columnList = "restorer_id, restoration_date DESC"),
        @Index(name = "idx_restorations_date_desc", columnList = "restoration_date DESC")
})
public class RestorationRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "relic_id", nullable = false)
    private Relic relic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "restorer_id", nullable = false)
    private User restorer;

    @Column(nullable = false)
    private LocalDate restorationDate;

    @Column(columnDefinition = "TEXT")
    private String materials;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String operations;

    private String beforePhotoPath;

    private String afterPhotoPath;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
