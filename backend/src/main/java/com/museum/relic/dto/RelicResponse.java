package com.museum.relic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RelicResponse {
    private Long id;
    private String relicNo;
    private String name;
    private String era;
    private String source;
    private String material;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
