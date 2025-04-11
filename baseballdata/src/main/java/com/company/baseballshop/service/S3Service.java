package com.company.baseballshop.service;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.File;

@Service
public class S3Service {

    private final S3Client s3Client;

    @Value("${customer.bucket.name}")
    private String customerBucketName;

    @Value("${product.bucket.name}")
    private String productBucketName;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    // 고객 사진 업로드
    public String uploadCustomerPhoto(String key, File file) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(customerBucketName)
                .key(key)
                .build();
        s3Client.putObject(request, RequestBody.fromFile(file));
        return "https://s3.ap-northeast-1.amazonaws.com/" + customerBucketName + "/" + key;
    }

    // 상품 사진 업로드
    public String uploadProductPhoto(String key, File file) {
        PutObjectRequest request = PutObjectRequest.builder()
                .bucket(productBucketName)
                .key(key)
                .build();
        s3Client.putObject(request, RequestBody.fromFile(file));
        return "https://s3.ap-northeast-1.amazonaws.com/" + productBucketName + "/" + key;
    }

    // 고객 사진 삭제
    public void deleteCustomerPhoto(String key) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(customerBucketName)
                .key(key)
                .build();
        s3Client.deleteObject(request);
    }

    // 상품 사진 삭제
    public void deleteProductPhoto(String key) {
        DeleteObjectRequest request = DeleteObjectRequest.builder()
                .bucket(productBucketName)
                .key(key)
                .build();
        s3Client.deleteObject(request);
    }
}