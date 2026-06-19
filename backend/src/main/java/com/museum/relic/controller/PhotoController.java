package com.museum.relic.controller;

import com.museum.relic.service.MinioService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final MinioService minioService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "prefix", defaultValue = "restoration") String prefix) {
        String objectName = minioService.uploadPhoto(file, prefix);
        Map<String, String> response = new HashMap<>();
        response.put("path", objectName);
        response.put("url", minioService.getPhotoUrl(objectName));
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{objectName:.+}")
    public ResponseEntity<InputStreamResource> getPhoto(@PathVariable String objectName) {
        try {
            InputStream inputStream = minioService.getPhoto(objectName);
            InputStreamResource resource = new InputStreamResource(inputStream);

            String contentType = "image/jpeg";
            if (objectName.endsWith(".png")) {
                contentType = "image/png";
            } else if (objectName.endsWith(".gif")) {
                contentType = "image/gif";
            } else if (objectName.endsWith(".webp")) {
                contentType = "image/webp";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/url/{objectName:.+}")
    public ResponseEntity<Map<String, String>> getPhotoUrl(@PathVariable String objectName) {
        Map<String, String> response = new HashMap<>();
        response.put("url", minioService.getPhotoUrl(objectName));
        return ResponseEntity.ok(response);
    }
}
