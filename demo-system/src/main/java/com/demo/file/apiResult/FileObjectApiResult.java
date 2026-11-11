package com.demo.file.apiResult;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.apache.ibatis.type.Alias;

import java.io.Serializable;
import java.util.Date;

/**
 * 客户端文件对象元信息响应。
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Alias("FileObjectApiResult")
public class FileObjectApiResult implements Serializable {

    /** 对象键 */
    private String objectKey;

    /** 长期可访问地址 */
    private String url;

    /**
     * 临时下载地址。云存储可签发时返回；本地存储通常为空。
     */
    private String presignedUrl;

    /** 字节大小 */
    private Long size;

    /** MIME 类型 */
    private String contentType;

    /** 落盘后端：local / rustfs / qiniu */
    private String storage;

    /** 最后修改时间 */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private Date lastModified;
}
