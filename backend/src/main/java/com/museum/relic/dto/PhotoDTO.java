package com.museum.relic.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PhotoDTO {
    private Long id;
    private String photoPath;
    private String photoName;
    private Integer sortOrder;
    private String url;
}
