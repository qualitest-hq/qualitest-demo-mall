package com.demo.file.service.impl;

import com.demo.file.apiResult.FileObjectApiResult;
import com.demo.file.apiResult.FileUploadApiResult;
import com.demo.file.service.IFileObjectService;
import com.demo.file.storage.FileStorageService;
import com.demo.file.storage.ObjectMeta;
import com.demo.file.storage.UploadResult;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * 客户端文件对象服务实现。调用统一存储服务完成读写，再映射为客户端响应结构。
 */
@Service
public class FileObjectServiceImpl implements IFileObjectService {

    private final FileStorageService fileStorageService;

    public FileObjectServiceImpl(FileStorageService fileStorageService) {
        this.fileStorageService = fileStorageService;
    }

    /**
     * 上传并组装客户端上传结果字段。
     */
    @Override
    public FileUploadApiResult upload(MultipartFile file, String bizType) {
        UploadResult result = fileStorageService.upload(file, bizType);
        return FileUploadApiResult.builder()
                .objectKey(result.getObjectKey())
                .url(result.getUrl())
                .size(result.getSize())
                .contentType(result.getContentType())
                .originalFilename(result.getOriginalFilename())
                .storage(result.getStorage())
                .build();
    }

    /**
     * 查询元信息并组装客户端响应。
     */
    @Override
    public FileObjectApiResult getObjectMeta(String objectKey) {
        ObjectMeta meta = fileStorageService.getObjectMeta(objectKey);
        return FileObjectApiResult.builder()
                .objectKey(meta.objectKey())
                .url(meta.url())
                .presignedUrl(meta.presignedUrl())
                .size(meta.size())
                .contentType(meta.contentType())
                .storage(meta.storage())
                .lastModified(meta.lastModified())
                .build();
    }

    @Override
    public void delete(String objectKey) {
        fileStorageService.delete(objectKey);
    }
}
