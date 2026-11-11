package com.demo.merchant.params;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

import java.io.Serializable;

/**
 * 管理端驳回商家申请入参
 *
 * @author demo
 * @since 2026-11-11
 */
@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class MerchantApplyRejectParams implements Serializable {

    /**
     * 申请ID
     */
    private Long applyId;

    /**
     * 驳回原因
     */
    private String rejectReason;
}
