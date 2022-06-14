import { PageQueryParam, PageResult } from "../base"

/**
 * 广告查询参数类型声明
 */
export interface AdvertQueryParam extends PageQueryParam {
    title: String | undefined
}

/**
 * 广告分页列表项声明
 */
export interface AdvertItem {
    id: string;
    name: string;
    logoUrl: string;
    sort: number;
}

/**
 * 广告分页项类型声明
 */
export interface AdvertPageResult extends PageResult<AdvertItem[]> {

}

/**
 * 广告表单类型声明
 */
export interface AdvertFormData {
    id: number | undefined;
    title: string;
    picUrl: string;
    beginTime: string;
    endTime: string;
    status: number;
    sort: number;
    url: string;
    remark: string;
}