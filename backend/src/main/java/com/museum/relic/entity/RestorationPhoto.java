package com.museum.relic.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "restoration_photos", indexes = {
        @Index(name = "idx_photos_record_sort", columnList = "record_id, sort_order")
})
public class RestorationPhoto {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "record_id", nullable = false)
    private RestorationRecord record;

    @Column(nullable = false)
    private String photoPath;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    private String photoName;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
