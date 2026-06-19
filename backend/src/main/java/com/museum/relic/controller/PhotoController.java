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
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
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

    @PostMapping("/batch-upload")
    public ResponseEntity<Map<String, Object>> uploadPhotosBatch(
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam(value = "prefix", defaultValue = "process") String prefix) {
        List<String> paths = minioService.uploadPhotosBatch(files, prefix);
        List<String> urls = new ArrayList<>();
        for (String path : paths) {
            urls.add(minioService.getPhotoUrl(path));
        }
        Map<String, Object> response = new HashMap<>();
        response.put("paths", paths);
        response.put("urls", urls);
        response.put("count", paths.size());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/upload-document")
    public ResponseEntity<Map<String, String>> uploadDocument(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "prefix", defaultValue = "solutions") String prefix) {
        String objectName = minioService.uploadDocument(file, prefix);
        Map<String, String> response = new HashMap<>();
        response.put("path", objectName);
        response.put("url", minioService.getPhotoUrl(objectName));
        response.put("fileName", file.getOriginalFilename());
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
