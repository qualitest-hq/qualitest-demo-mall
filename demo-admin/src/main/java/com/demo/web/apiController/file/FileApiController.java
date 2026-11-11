package com.demo.web.apiController.file;

import com.demo.common.core.controller.ApiController;
import com.demo.common.core.domain.R;
import com.demo.file.apiResult.FileObjectApiResult;
import com.demo.file.apiResult.FileUploadApiResult;
import com.demo.file.service.IFileObjectService;
import lombok.AllArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * 客户端文件接口。上传、查询、删除均走统一存储服务，实际后端由 demo.storage.type 决定。
 *
 * @api.group 客户端.进阶.文件
 *
 * @author demo
 */
@RestController
@RequestMapping("/api/file")
@AllArgsConstructor
public class FileApiController extends ApiController {

    private final IFileObjectService fileObjectService;

    /**
     * 上传文件。浏览器把文件交给本接口，服务端再写入当前配置的存储后端。
     *
     * @param file    上传文件
     * @param bizType 业务分类，可选，如 avatar、product；影响对象键目录
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public R<FileUploadApiResult> upload(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "bizType", required = false) String bizType) {
        return ok(fileObjectService.upload(file, bizType));
    }

    /**
     * 按对象键查询元信息；云存储可用时可能附带临时下载地址。
     *
     * @param key 上传返回的 objectKey
     */
    @GetMapping
    public R<FileObjectApiResult> meta(@RequestParam("key") String key) {
        return ok(fileObjectService.getObjectMeta(key));
    }

    /**
     * 按对象键删除文件。
     *
     * @param key 对象键
     */
    @DeleteMapping
    public R<Void> delete(@RequestParam("key") String key) {
        fileObjectService.delete(key);
        return ok();
    }
}
