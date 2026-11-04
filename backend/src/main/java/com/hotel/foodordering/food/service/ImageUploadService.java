package com.hotel.foodordering.food.service;

import com.hotel.foodordering.common.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

/**
 * Uploads food images.
 * - When app.aws.s3.enabled=true, uploads to the configured S3 bucket and returns the S3/CloudFront URL.
 * - Otherwise, saves to a local "uploads" folder and returns a relative URL, which is convenient
 *   for running the whole system locally before AWS credentials are set up.
 */
@Service
public class ImageUploadService {

    private static final List<String> ALLOWED_TYPES = List.of("image/jpeg", "image/png", "image/webp");

    private final S3Client s3Client;

    @Value("${app.aws.s3.enabled}")
    private boolean s3Enabled;

    @Value("${app.aws.s3.bucket}")
    private String bucket;

    @Value("${app.aws.s3.region}")
    private String region;

    public ImageUploadService(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String upload(MultipartFile file, String keyPrefix) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("No file provided");
        }
        if (!ALLOWED_TYPES.contains(file.getContentType())) {
            throw new BadRequestException("Only JPEG, PNG or WEBP images are allowed");
        }

        String extension = switch (file.getContentType()) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
        String key = keyPrefix + "/" + UUID.randomUUID() + extension;

        try {
            if (s3Enabled) {
                return uploadToS3(file, key);
            }
            return uploadToLocalDisk(file, key);
        } catch (IOException e) {
            throw new BadRequestException("Failed to upload image: " + e.getMessage());
        }
    }

    private String uploadToS3(MultipartFile file, String key) throws IOException {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(bucket)
                .key(key)
                .contentType(file.getContentType())
                .build();
        s3Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucket, region, key);
    }

    private String uploadToLocalDisk(MultipartFile file, String key) throws IOException {
        Path uploadDir = Paths.get("uploads");
        Path target = uploadDir.resolve(key).normalize();
        Files.createDirectories(target.getParent());
        file.transferTo(target);
        return "/uploads/" + key;
    }
}
