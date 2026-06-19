package com.museum.relic.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RestorationRequest {
    @NotNull
    private Long relicId;

    @NotNull
    private LocalDate restorationDate;

    private String materials;

    @NotBlank
    private String operations;

    private String beforePhotoPath;

    private String afterPhotoPath;

    private String notes;
}
