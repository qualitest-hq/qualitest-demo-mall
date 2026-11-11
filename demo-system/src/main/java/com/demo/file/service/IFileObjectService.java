package com.demo.file.service;

import com.demo.file.apiResult.FileObjectApiResult;
import com.demo.file.apiResult.FileUploadApiResult;
import org.springframework.web.multipart.MultipartFile;

/**
 * 客户端文件对象能力：上传、查元信息、删除。实际落盘后端由统一存储配置决定。
 */
public interface IFileObjectService {

    /**
     * 上传文件。
     *
     * @param file    必填
     * @param bizType 业务分类，可选，如 avatar、product；影响对象键目录
     */
    FileUploadApiResult upload(MultipartFile file, String bizType);

    /**
     * 按对象键查询大小、类型、访问地址及可选预签名 URL。
     *
     * @param objectKey 对象键
     */
    FileObjectApiResult getObjectMeta(String objectKey);

    /**
     * 按对象键删除。
     *
     * @param objectKey 对象键
     */
    void delete(String objectKey);
}
