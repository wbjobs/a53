package com.museum.relic.service;

import com.museum.relic.config.MinioConfig;
import io.minio.*;
import io.minio.http.Method;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class MinioService {

    private static final long MULTIPART_THRESHOLD = 5 * 1024 * 1024;
    private static final int MAX_RETRIES = 3;

    private final MinioClient minioClient;
    private final MinioConfig minioConfig;

    public String uploadPhoto(MultipartFile file, String prefix) {
        try {
            ensureBucketExists();

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String objectName = prefix + "/" + UUID.randomUUID() + extension;

            byte[] fileData = file.getBytes();
            String clientMd5 = computeMd5(fileData);

            uploadWithRetry(file, objectName, fileData);

            verifyIntegrity(objectName, clientMd5);

            return objectName;
        } catch (Exception e) {
            log.error("上传照片失败", e);
            throw new RuntimeException("上传照片失败: " + e.getMessage());
        }
    }

    public List<String> uploadPhotosBatch(List<MultipartFile> files, String prefix) {
        ensureBucketExists();
        List<String> paths = new ArrayList<>();

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            try {
                String originalFilename = file.getOriginalFilename();
                String extension = "";
                if (originalFilename != null && originalFilename.contains(".")) {
                    extension = originalFilename.substring(originalFilename.lastIndexOf("."));
                }
                String objectName = prefix + "/" + UUID.randomUUID() + extension;

                byte[] fileData = file.getBytes();
                String clientMd5 = computeMd5(fileData);

                uploadWithRetry(file, objectName, fileData);
                verifyIntegrity(objectName, clientMd5);

                paths.add(objectName);
                log.info("批量上传进度: {}/{}", i + 1, files.size());
            } catch (Exception e) {
                log.error("批量上传第{}张照片失败", i + 1, e);
                throw new RuntimeException("批量上传失败，第" + (i + 1) + "张照片: " + e.getMessage());
            }
        }

        return paths;
    }

    public String uploadDocument(MultipartFile file, String prefix) {
        try {
            ensureBucketExists();

            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String objectName = prefix + "/" + UUID.randomUUID() + extension;

            byte[] fileData = file.getBytes();
            String clientMd5 = computeMd5(fileData);

            uploadWithRetry(file, objectName, fileData);
            verifyIntegrity(objectName, clientMd5);

            return objectName;
        } catch (Exception e) {
            log.error("上传文档失败", e);
            throw new RuntimeException("上传文档失败: " + e.getMessage());
        }
    }

    private void uploadWithRetry(MultipartFile file, String objectName, byte[] fileData) throws Exception {
        Exception lastException = null;

        for (int attempt = 1; attempt <= MAX_RETRIES; attempt++) {
            try {
                if (fileData.length >= MULTIPART_THRESHOLD) {
                    log.info("大文件上传(>5MB): {}, 大小: {} bytes, 尝试 {}/{}",
                            objectName, fileData.length, attempt, MAX_RETRIES);
                }

                InputStream inputStream = new java.io.ByteArrayInputStream(fileData);
                minioClient.putObject(PutObjectArgs.builder()
                        .bucket(minioConfig.getBucketName())
                        .object(objectName)
                        .stream(inputStream, fileData.length, -1)
                        .contentType(file.getContentType())
                        .build());

                log.info("上传完成: {}, 大小: {} bytes", objectName, fileData.length);
                return;
            } catch (Exception e) {
                lastException = e;
                log.warn("上传失败 (尝试 {}/{}): {} - {}", attempt, MAX_RETRIES, objectName, e.getMessage());
                if (attempt < MAX_RETRIES) {
                    long delay = (long) Math.pow(2, attempt) * 1000;
                    Thread.sleep(delay);
                }
            }
        }

        throw new RuntimeException("上传重试" + MAX_RETRIES + "次后仍失败: " + lastException.getMessage(), lastException);
    }

    private void verifyIntegrity(String objectName, String clientMd5) throws Exception {
        try (InputStream is = minioClient.getObject(GetObjectArgs.builder()
                .bucket(minioConfig.getBucketName())
                .object(objectName)
                .build())) {

            MessageDigest digest = MessageDigest.getInstance("MD5");
            byte[] buffer = new byte[8192];
            int bytesRead;
            while ((bytesRead = is.read(buffer)) != -1) {
                digest.update(buffer, 0, bytesRead);
            }
            byte[] hashBytes = digest.digest();
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            String serverMd5 = sb.toString();

            if (!clientMd5.equalsIgnoreCase(serverMd5)) {
                log.error("文件完整性校验失败! objectName={}, 客户端MD5={}, 服务端MD5={}",
                        objectName, clientMd5, serverMd5);
                try {
                    minioClient.removeObject(RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .build());
                    log.info("已删除损坏文件: {}", objectName);
                } catch (Exception ex) {
                    log.error("删除损坏文件失败", ex);
                }
                throw new RuntimeException("文件完整性校验失败，上传的文件可能已损坏，请重新上传");
            }

            log.info("文件完整性校验通过: {}, MD5={}", objectName, clientMd5);
        }
    }

    private String computeMd5(byte[] data) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("MD5");
        byte[] hashBytes = digest.digest(data);
        StringBuilder sb = new StringBuilder();
        for (byte b : hashBytes) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }

    public InputStream getPhoto(String objectName) {
        try {
            return minioClient.getObject(GetObjectArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .object(objectName)
                    .build());
        } catch (Exception e) {
            log.error("获取照片失败", e);
            throw new RuntimeException("获取照片失败: " + e.getMessage());
        }
    }

    public String getPhotoUrl(String objectName) {
        try {
            return minioClient.getPresignedObjectUrl(GetPresignedObjectUrlArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .object(objectName)
                    .method(Method.GET)
                    .expiry(60 * 60 * 24)
                    .build());
        } catch (Exception e) {
            log.error("获取照片URL失败", e);
            return "/api/photos/" + objectName;
        }
    }

    private void ensureBucketExists() {
        try {
            if (!minioClient.bucketExists(BucketExistsArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .build())) {
                minioClient.makeBucket(MakeBucketArgs.builder()
                        .bucket(minioConfig.getBucketName())
                        .build());
            }
        } catch (Exception e) {
            log.error("检查/创建Bucket失败", e);
        }
    }
}
