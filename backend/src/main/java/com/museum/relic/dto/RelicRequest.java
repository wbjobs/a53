package com.museum.relic.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.validation.constraints.NotBlank;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RelicRequest {
    @NotBlank
    private String relicNo;

    @NotBlank
    private String name;

    private String era;

    private String source;

    private String material;

    private String description;
}
