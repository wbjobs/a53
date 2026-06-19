package com.museum.relic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestorationResponse {
    private Long id;
    private Long relicId;
    private String relicNo;
    private String relicName;
    private Long restorerId;
    private String restorerName;
    private LocalDate restorationDate;
    private String materials;
    private String operations;
    private String beforePhotoPath;
    private String afterPhotoPath;
    private String notes;
    private LocalDateTime createdAt;
}
