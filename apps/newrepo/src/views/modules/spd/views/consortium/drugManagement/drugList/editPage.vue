<script lang="ts" setup>
import type { PropType } from 'vue';

import { ref, watch } from 'vue';

import {
  AntdArrowLeftOutlined,
  AntdDownOutlined,
  AntdRightOutlined,
  MdiLightDelete,
  PlusOutlined,
  UploadCloudIcon,
} from '@vben/chc-icons';
import { ChcSelect } from '@vben/chc-ui';

import {
  Button as AntButton,
  DatePicker as AntDatePicker,
  Input as AntdInput,
  Tooltip as AntdTooltip,
  Upload as AntdUpload,
  message,
  Modal,
} from 'ant-design-vue';

import { INITIAL_EDIT_FORM_DATA } from './data';

/**
 * 表单数据类型定义
 */
interface FormValue {
  [key: string]: any;
}

// ==================== Props 定义 ====================
// AI-GENERATED-BEGIN
// @date 2026-04-20
// @prompt 分析药品编辑页面的脚本部分并补充注释
// @description 定义组件接收的 props 和事件，包括当前页面模式、查看模式标识、表单数据双向绑定等
const props = defineProps({
  /** 当前页面模式：新增/详情/编辑/列表 */
  currentPage: {
    type: String as PropType<'ADD' | 'DETAIL' | 'EDIT' | 'LIST'>,
    default: 'LIST',
  },
  /** 是否为查看模式（查看模式下所有字段禁用） */
  isViewMode: {
    type: Boolean,
    default: false,
  },
});

// ==================== Events 定义 ====================
const emit = defineEmits<{
  (e: 'save'): void; // 保存事件
  (e: 'submit'): void; // 提交事件
  (e: 'back'): void; // 返回列表事件
}>();

// ==================== 表单数据双向绑定 ====================
// 使用 v-model:formData 与父组件同步表单数据，默认使用 INITIAL_EDIT_FORM_DATA 作为初始值
const formData = defineModel<FormValue>('formData', {
  required: true,
  default: () => ({ ...INITIAL_EDIT_FORM_DATA }),
});

// ==================== 区块展开/收起状态管理 ====================
// 控制各个信息区块的展开收起状态，false 表示展开（显示内容），true 表示收起（隐藏内容）
const sectionCollapsed = ref({
  basicFields: false, // 基础信息区块
  extendedInfo: false, // 扩展信息区块
  managementSettings: false, // 管理信息区块
  priceInfo: false, // 价格信息区块
  provincialPlatform: false, // 省平台基础信息区块
  packageInfo: false, // 包装信息区块
});

// 监听页面模式变化，重置所有区块为展开状态，刷新阳光采购通用名下拉组件
const ygcgSelectKey = ref(0);
watch(
  () => props.currentPage,
  () => {
    sectionCollapsed.value = {
      basicFields: false,
      extendedInfo: false,
      managementSettings: false,
      priceInfo: false,
      provincialPlatform: false,
      packageInfo: false,
    };
    ygcgSelectKey.value = Date.now();
  },
);

/**
 * 切换指定 section 的展开/收起状态
 * @param section - 区块标识符（如 'basicFields', 'priceInfo' 等）
 * @param event - 点击事件对象
 */
const toggleSection = (section: string, event: Event) => {
  event.preventDefault();
  sectionCollapsed.value = {
    ...sectionCollapsed.value,
    [section]:
      !sectionCollapsed.value[section as keyof typeof sectionCollapsed.value],
  };
};

/**
 * 获取字段的显示值（用于只读展示场景）
 * @param field - 字段名
 * @returns 格式化后的显示文本
 */
const getDisplayValue = (field: string): string => {
  // 物资状态字段特殊处理：false 显示"草稿"，否则显示"生效"
  if (field === 'status') {
    if (formData.value[field] === 'DR') {
      return '草稿';
    } else if (formData.value[field] === 'CO') {
      return '生效';
    } else {
      return '';
    }
  }
  return formData.value[field] || '';
};

/**
 * 图片上传前的格式和大小校验
 * @param file - 待上传的文件
 * @returns 是否允许上传
 */
const beforePictureUpload = (file: File): boolean => {
  // 允许的格式：JPG、PNG、JPEG、GIF
  const isValidType = [
    'image/gif',
    'image/jpeg',
    'image/jpg',
    'image/png',
  ].includes(file.type);
  // 文件大小限制：2MB
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isValidType) {
    message.error('上传图片只能是 JPG、PNG、JPEG、GIF 格式!');
    return false;
  }
  if (!isLt2M) {
    message.error('上传图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

/**
 * 自定义图片上传逻辑
 * 将图片转为 base64 字符串存储到表单数据中
 * @param param - 上传参数，包含 file 对象
 */
const customRequest = async (param: any) => {
  const file = param.file;

  // 使用 FileReader 将文件转为 base64 格式
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.addEventListener('load', () => {
    const base64 = reader.result as string;
    // 将 base64 数据存入表单字段
    formData.value.photoUrlBase = base64;
  });
};

/**
 * 处理"毒麻精放"字段变化事件
 * 有值时自动设置 特殊药品=是 和 是否回收=是，无值时设置为否
 */
const handleSpecialTypeChange = () => {
  if (formData.value.specialType) {
    formData.value.isSpecial = 'Y';
    formData.value.isRecycle = 'Y';
  } else {
    formData.value.isSpecial = 'N';
    formData.value.isRecycle = 'N';
  }
  // 切换毒麻精放时清空精神分类
  formData.value.spiritType = undefined;
};

/**
 * 处理"精神分类"字段变化事件
 * 精一：特殊药品=否，是否回收=是
 * 精二：特殊药品=否，是否回收=否
 */
const handleSpiritTypeChange = () => {
  if (formData.value.spiritType === 1) {
    // 精一
    formData.value.isSpecial = 'Y';
    formData.value.isRecycle = 'Y';
  } else if (formData.value.spiritType === 2) {
    // 精二
    formData.value.isSpecial = 'N';
    formData.value.isRecycle = 'N';
  }
};

/**
 * 处理"长期有效"字段变化事件
 * 选择"是"时清空"注册证有效期止"字段
 * @param value - 长期有效的值（'Y' 或 'N'）
 */
const handleIsLongChange = (value: string) => {
  if (value === 'Y') {
    formData.value.certValidTo = '';
  }
};

/**
 * 删除已上传图片的确认处理
 * 弹出确认对话框，确认后清空图片数据
 */
const deletePicture = () => {
  Modal.confirm({
    title: '提示',
    content: '确定要删除该图片吗？',
    okText: '确定',
    cancelText: '取消',
    onOk() {
      // 清空图片相关数据（base64 和 URL）
      formData.value.photoUrlBase = '';
      formData.value.photoUrl = null;
      message.success('图片删除成功');
    },
  });
};

// ==================== 操作按钮事件处理 ====================

/**
 * 提交表单（触发 submit 事件）
 */
const handleSubmit = () => {
  emit('submit');
};

/**
 * 返回列表页面（触发 back 事件）
 */
const handleBack = () => {
  emit('back');
};

/**
 * 保存表单（触发 save 事件）
 */
const handleSave = () => {
  emit('save');
};

/**
 * 获取下拉框的容器挂载点
 * 将下拉框挂载到指定表单容器内，避免层级遮挡问题
 * @param idName - 目标容器的 id 属性值
 * @returns 返回容器元素的函数
 */
const getPopupContainer = (idName: string) => {
  return () => document.querySelector(`#${idName}`) || document.body;
};

/**
 * 获取日期选择器的容器挂载点
 * 固定挂载到 #basicForm 容器内
 */
const getDatePickerPopupContainer = () => document.querySelector('#basicForm');
// AI-GENERATED-END
</script>

<template>
  <div
    class="form-container relative box-border flex h-full w-full flex-col overflow-y-auto overflow-x-hidden bg-white p-5 pb-20"
  >
    <!-- 基础信息 -->
    <div class="section-title" @click="toggleSection('basicFields', $event)">
      <div class="flex flex-1 items-center justify-start">
        <span class="remark"></span>基础信息
      </div>

      <AntdRightOutlined
        v-show="sectionCollapsed.basicFields"
        class="toggle-icon"
      />
      <AntdDownOutlined
        v-show="!sectionCollapsed.basicFields"
        class="toggle-icon"
      />
    </div>
    <div
      class="table-form"
      id="basicForm"
      v-show="!sectionCollapsed.basicFields"
    >
      <table class="info-table">
        <tbody>
          <!-- 第一行：药品编码、药品名称、规格、剂型、物资状态 -->
          <tr>
            <td class="label">药品编码</td>
            <td class="value">
              <!-- <AntdInput
                allow-clear
                v-model:value="formData.productCode"
                size="small"
                placeholder="请输入药品编码"
                :disabled="isViewMode"
                class=""
              /> -->
              {{ getDisplayValue('productCode') }}
            </td>
            <td class="label--require">
              <span class="text-red">*</span> 药品名称
            </td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.name"
                size="small"
                placeholder="请输入产品名称"
                :disabled="isViewMode"
                class=""
              />
            </td>
            <td class="label--require"><span class="text-red">*</span> 规格</td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.productSpec"
                size="small"
                placeholder="请输入规格"
                :disabled="isViewMode"
                class=""
              />
            </td>
            <td class="label--require"><span class="text-red">*</span> 剂型</td>
            <td class="value">
              <ChcSelect
                v-model="formData.productStyle"
                dict-url="/baseHandleAction/refList.do?id=1000183"
                placeholder="请选择剂型"
                class="box-border w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
                :get-popup-container="getPopupContainer('basicForm')"
              />
            </td>
            <td class="label">物资状态</td>
            <td class="value text-center">
              {{ getDisplayValue('status') }}
            </td>
          </tr>
          <!-- 第二行：通用名、自定义编码、注册证有效期止、长期有效、物资图片(跨行) -->
          <tr>
            <td class="label">通用名</td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.medicineName"
                size="small"
                placeholder="请输入通用名"
                :disabled="isViewMode"
                class=""
              />
            </td>
            <td class="label">自定义编码</td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.productUserCode"
                size="small"
                placeholder="请输入自定义编码"
                :disabled="isViewMode"
              />
            </td>

            <td class="label">注册证有效期止</td>
            <td class="value">
              <AntDatePicker
                v-model:value="formData.certValidTo"
                type="date"
                placeholder="请选择有效期"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                :disabled="isViewMode || formData.isLong === 'Y'"
                :get-popup-container="getDatePickerPopupContainer"
              />
            </td>
            <td class="label">长期有效</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isLong"
                placeholder="请选择长期有效"
                class="w-full"
                :paginate="false"
                :immediate="false"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                @change="handleIsLongChange"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="getPopupContainer('basicForm')"
              />
            </td>
            <td class="label" rowspan="4">
              物资图片
              <div class="upload-tip" style="">
                (支持jpg、png、jpeg、gif格式，<br />大小不超过2MB)
              </div>
            </td>
            <td class="value picture-upload-cell" rowspan="4">
              <div class="picture-upload-container">
                <!-- 编辑模式下的图片上传 -->
                <div v-if="!isViewMode" class="upload-section">
                  <AntdUpload
                    v-if="!formData?.photoUrlBase && !formData?.photoUrl"
                    list-type="picture-card"
                    class="avatar-uploader material-picture-uploader"
                    :show-upload-list="false"
                    :before-upload="beforePictureUpload"
                    :max-count="1"
                    :custom-request="customRequest"
                    accept="image/gif, image/jpeg, image/png, image/jpg"
                  >
                    <PlusOutlined />
                  </AntdUpload>
                  <div v-else class="picture-preview">
                    <img
                      :src="formData?.photoUrlBase || formData?.photoUrl"
                      alt="物资图片"
                    />
                    <div class="picture-overlay" @click="deletePicture">
                      <div
                        class="flex h-[26px] w-[26px] items-center justify-center rounded-sm text-[18px] text-white hover:bg-white hover:bg-opacity-10 hover:text-[#f56c6c]"
                      >
                        <MdiLightDelete class="icon-delete" />
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 查看模式下的图片显示 -->
                <div v-else>
                  <div
                    v-if="formData?.photoUrl"
                    class="picture-preview cursor-not-allowed"
                  >
                    <img :src="formData?.photoUrl" alt="物资图片" />
                  </div>
                  <div v-else class="no-picture cursor-not-allowed">
                    暂无图片
                  </div>
                </div>
              </div>
            </td>
          </tr>
          <!-- 第三行： 拼音码、 品牌、生产企业、药品来源 -->
          <tr>
            <td class="label">拼音码</td>
            <td class="value">
              <div v-if="getDisplayValue('value').length < 19">
                {{ getDisplayValue('value') }}
              </div>
              <div v-else class="truncate">
                <AntdTooltip placement="topLeft">
                  <template #title> {{ getDisplayValue('value') }}</template>
                  {{ getDisplayValue('value') }}
                </AntdTooltip>
              </div>
            </td>
            <td class="label">品牌</td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.productName"
                size="small"
                placeholder="请输入品牌"
                :disabled="isViewMode"
                :maxlength="50"
                class=""
              />
            </td>
            <td class="label--require">
              <span class="text-red">*</span>生产企业
            </td>
            <td class="value">
              <ChcSelect
                v-model="formData.manufacturerId"
                dict-url="/productAction/manufacturerList.do"
                placeholder="请选择生产企业"
                class="w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return {
                      ...res,
                      rows: undefined,
                      records: (res.rows || []).map((item: any) => ({
                        ...item,
                        id: item.id != null ? String(item.id) : undefined,
                      })),
                    };
                  }
                "
                :get-popup-container="getPopupContainer('basicForm')"
              />
            </td>
            <td class="label--require">
              <span class="text-red">*</span>是否进口
            </td>
            <td class="value">
              <ChcSelect
                v-model="formData.isForeign"
                placeholder="请选择是否进口"
                class="w-full"
                :paginate="false"
                :immediate="false"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="getPopupContainer('basicForm')"
              />
            </td>
          </tr>
          <!-- 第四行：批准文号、单位、最小单位、转换比-->
          <tr>
            <td class="label--require">
              <span class="text-red">*</span> 批准文号
            </td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.certificateNo"
                size="small"
                placeholder="请输入批准文号"
                class=""
                :maxlength="50"
                :disabled="isViewMode"
              />
            </td>
            <td class="label--require"><span class="text-red">*</span> 单位</td>
            <td class="value">
              <ChcSelect
                v-model="formData.uomId"
                dict-url="/baseHandleAction/refList.do?id=114"
                placeholder="请选择单位"
                class="w-full"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :paginate="false"
                :immediate="true"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return {
                      ...res,
                      rows: undefined,
                      records: (res.rows || []).map((item: any) => ({
                        ...item,
                        id: item.id != null ? String(item.id) : undefined,
                      })),
                    };
                  }
                "
                :get-popup-container="getPopupContainer('basicForm')"
              />
            </td>
            <td class="label--require">
              <span class="text-red">*</span> 最小单位
            </td>
            <td class="value">
              <ChcSelect
                v-model="formData.baseUOMId"
                dict-url="/baseHandleAction/refList.do?id=114"
                placeholder="请选择最小单位"
                class="w-full"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :paginate="false"
                :immediate="true"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return {
                      ...res,
                      rows: undefined,
                      records: (res.rows || []).map((item: any) => ({
                        ...item,
                        id: item.id != null ? String(item.id) : undefined,
                      })),
                    };
                  }
                "
                :get-popup-container="getPopupContainer('basicForm')"
              />
            </td>
            <td class="label--require">
              <span class="text-red">*</span> 转换比
            </td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value.number="formData.baseUOMQty"
                size="small"
                placeholder="请输入转换比"
                :maxlength="20"
                class=""
                :disabled="isViewMode"
              />
            </td>
          </tr>
          <!-- 第五行：基本药物分类、医保药品编码、医保分类、医保支付类别 -->
          <tr>
            <td class="label--require">
              <span class="text-red">*</span> 基本药物分类
            </td>
            <td class="value">
              <ChcSelect
                v-model="formData.essentialDrugType"
                dict-url="/baseHandleAction/refList.do?id=1000491"
                placeholder="请选择基本药物分类"
                class="w-full"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :paginate="false"
                :immediate="true"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
                :get-popup-container="getPopupContainer('basicForm')"
              />
            </td>
            <td class="label">医保药品编码</td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.insurance"
                size="small"
                placeholder="请输入医保药品编码"
                :disabled="isViewMode"
                class=""
              />
            </td>
            <td class="label">医保分类</td>
            <td class="value">
              <ChcSelect
                v-model="formData.zlType"
                dict-url="/baseHandleAction/refList.do?id=1000426"
                placeholder="请选择医保分类"
                class="w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
                :get-popup-container="getPopupContainer('basicForm')"
              />
            </td>
            <td class="label--require">
              <span class="text-red">*</span> 医保支付类别
            </td>
            <td class="value">
              <ChcSelect
                v-model="formData.insurancePaymentType"
                dict-url="/baseHandleAction/refList.do?id=1000630"
                placeholder="请选择医保支付类别"
                class="w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
                :get-popup-container="getPopupContainer('basicForm')"
              />
            </td>
          </tr>
          <!-- 第六行： 是否一致性评价、是否重点监控、存储条件、默认供应商 -->
          <tr>
            <td class="label--require">
              <span class="text-red">*</span> 是否一致性评价
            </td>
            <td class="value">
              <ChcSelect
                v-model="formData.isConsistent"
                placeholder="请选择是否一致性评价"
                class="w-full"
                :paginate="false"
                :immediate="false"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="getPopupContainer('basicForm')"
              />
            </td>
            <td class="label--require">
              <span class="text-red">*</span> 是否重点监控
            </td>
            <td class="value">
              <ChcSelect
                v-model="formData.isIntensive"
                placeholder="请选择是否重点监控"
                class="w-full"
                :paginate="false"
                :immediate="false"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="getPopupContainer('basicForm')"
              />
            </td>
            <td class="label">存储条件</td>
            <td class="value">
              <ChcSelect
                v-model="formData.storageCondition"
                dict-url="/baseHandleAction/refList.do?id=1000004"
                placeholder="请选择存储条件"
                class="w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return {
                      ...res,
                      rows: undefined,
                      records: (res.rows || []).map((item: any) => ({
                        ...item,
                        id: item.id != null ? String(item.id) : undefined,
                      })),
                    };
                  }
                "
                :get-popup-container="getPopupContainer('basicForm')"
              />
            </td>
            <td class="label--require">
              <span class="text-red">*</span> 默认供应商
            </td>
            <td class="value">
              <ChcSelect
                v-model="formData.defaultVendorId"
                dict-url="/baseHandleAction/vendor.do"
                placeholder="请选择默认供应商"
                class="w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return {
                      ...res,
                      rows: undefined,
                      records: (res.rows || []).map((item: any) => ({
                        ...item,
                        id: item.id != null ? String(item.id) : undefined,
                      })),
                    };
                  }
                "
                :get-popup-container="getPopupContainer('basicForm')"
              />
            </td>
            <td class="label"></td>
            <td class="value"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 管理信息 -->
    <div
      class="section-title"
      @click="toggleSection('managementSettings', $event)"
    >
      <div class="flex flex-1 items-center justify-start">
        <span class="remark"></span>管理信息
      </div>

      <AntdRightOutlined
        v-show="sectionCollapsed.managementSettings"
        class="toggle-icon"
      />
      <AntdDownOutlined
        v-show="!sectionCollapsed.managementSettings"
        class="toggle-icon"
      />
    </div>
    <div
      class="table-form"
      id="managementSettingsForm"
      v-show="!sectionCollapsed.managementSettings"
    >
      <table class="info-table">
        <tbody>
          <!-- 第一行：是否临采、是否带量采购、带量采购分类、、是否新品、备注-->
          <tr>
            <td class="label">是否临采</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isShortPo"
                placeholder="请选择是否临采"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">是否带量采购</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isBulkPurchase"
                placeholder="请选择是否带量采购"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">带量采购分类</td>
            <td class="value">
              <ChcSelect
                v-model="formData.bulkPurchaseType"
                dict-url="/baseHandleAction/refList.do?id=1000563"
                placeholder="请选择带量采购分类"
                class="w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>

            <td class="label">是否新品</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isNew"
                placeholder="请选择是否新品"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">备注</td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.description"
                size="small"
                placeholder="请输入备注"
                :disabled="isViewMode"
              />
            </td>
          </tr>
          <!-- 第二行：批号管理、有效期必填、生产日期必填、近效期必填 、产地必填-->
          <tr>
            <td class="label">批号管理</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isLot"
                placeholder="请选择批号管理"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">有效期必填</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isGuaranteeDateMandatory"
                placeholder="请选择有效期必填"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">生产日期必填</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isProductionDateMandatory"
                placeholder="请选择生产日期必填"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">近效期天数</td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.guaranteeDaysMin"
                size="small"
                placeholder="请输入近效期天数"
                :disabled="isViewMode"
                :maxlength="20"
              />
            </td>
            <td class="label">产地必填</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isProductAreaMandatory"
                placeholder="请选择产地必填"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
          </tr>
          <!-- 第三行：包装管理、是否单包、双人作业、毒麻分类、抗菌药物类型 -->
          <tr>
            <td class="label">包装管理</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isStoragePackage"
                placeholder="请选择包装管理"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">是否单包</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isBasePackage"
                placeholder="请选择是否单包"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">双人作业</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isControlledProduct"
                placeholder="请选择双人作业"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">毒麻分类</td>
            <td class="value">
              <ChcSelect
                v-model="formData.narcoticType"
                dict-url="/baseHandleAction/refList.do?id=1000568"
                placeholder="请选择毒麻分类"
                class="w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">抗菌药物类型</td>
            <td class="value">
              <ChcSelect
                v-model="formData.antiDrugType"
                dict-url="/baseHandleAction/refList.do?id=1000492"
                placeholder="请选择抗菌药物类型"
                class="w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
          </tr>
          <!-- 第四行：药品组、抗肿瘤、肿瘤分类、皮试类型、生物创新药-->
          <tr>
            <td class="label--require">
              <span class="text-red">*</span>药品组
            </td>
            <td class="value">
              <ChcSelect
                v-model="formData.productControlLevel"
                dict-url="/baseHandleAction/refList.do?id=1000244"
                placeholder="请选择药品组"
                class="w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">抗肿瘤</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isAntitumor"
                placeholder="请选择是否抗肿瘤"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">肿瘤分类</td>
            <td class="value">
              <ChcSelect
                v-model="formData.antitumorType"
                dict-url="/baseHandleAction/refList.do?id=1000569"
                placeholder="请选择肿瘤分类"
                class="w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">皮试类型</td>
            <td class="value">
              <ChcSelect
                v-model="formData.skinTestType"
                dict-url="/baseHandleAction/refList.do?id=1000570"
                placeholder="请选择皮试类型"
                class="w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">生物创新药</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isInnovate"
                placeholder="请选择生物创新药"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
          </tr>
          <!-- 第五行：是否重点监控、默认供应商、采购价格 -->
          <tr>
            <td class="label--require">
              <span class="text-red">*</span>药品类别
            </td>
            <td class="value">
              <ChcSelect
                v-model="formData.productCategoryId"
                dict-url="/productAction/productCategoryList.do"
                placeholder="请选择药品类别"
                class="w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">追溯码前缀</td>
            <td class="value" :colspan="3">
              <AntdInput
                allow-clear
                v-model:value="formData.tracCode"
                size="small"
                placeholder="请输入追溯码前缀，多个前缀之间用逗号隔开"
                :disabled="isViewMode"
              />
            </td>
            <td class="label">是否高警示</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isHighWarning"
                placeholder="请选择是否高警示"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">是否看似</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isSeem"
                placeholder="请选择是否看似"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
          </tr>
          <!-- 第六行：新增安全与特殊属性标识 -->
          <tr>
            <td class="label">是否听似</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isSound"
                placeholder="请选择是否听似"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">是否多规格</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isMultiSpecification"
                placeholder="请选择是否多规格"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <!-- <td class="label">是否麻</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isAnesthetic"
                placeholder="请选择是否麻"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">是否毒</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isPoison"
                placeholder="请选择是否毒"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">是否精</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isEssence"
                placeholder="请选择是否精"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td> -->
            <td class="label">是否催排卵</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isOvulation"
                placeholder="请选择是否催排卵"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">是否终止妊娠</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isTerminationOfPregnancy"
                placeholder="请选择是否终止妊娠"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">是否冷藏</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isRefrigeration"
                placeholder="请选择是否冷藏"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
          </tr>
          <!-- 第七行：特殊药品属性 -->
          <tr>
            <td class="label">毒麻精放</td>
            <td class="value">
              <ChcSelect
                v-model="formData.specialType"
                placeholder="请选择毒麻精放"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                @change="handleSpecialTypeChange"
                :options="[
                  { label: '毒', value: 'D' },
                  { label: '麻', value: 'M' },
                  { label: '精', value: 'J' },
                  { label: '放', value: 'F' },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <template v-if="formData.specialType === 'J'">
              <td class="label">精神分类</td>
              <td class="value">
                <ChcSelect
                  v-model="formData.spiritType"
                  placeholder="请选择精神分类"
                  class="w-full"
                  :paginate="false"
                  :immediate="false"
                  filter-field="label"
                  label-field="label"
                  value-field="value"
                  :disabled="isViewMode"
                  @change="handleSpiritTypeChange"
                  :options="[
                    { label: '精一', value: 1 },
                    { label: '精二', value: 2 },
                  ]"
                  :get-popup-container="
                    getPopupContainer('managementSettingsForm')
                  "
                />
              </td>
            </template>

            <td class="label">是否特殊</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isSpecial"
                placeholder="请选择是否特殊"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label">是否回收</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isRecycle"
                placeholder="请选择是否回收"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  { label: '是', value: 'Y' },
                  { label: '否', value: 'N' },
                ]"
                :get-popup-container="
                  getPopupContainer('managementSettingsForm')
                "
              />
            </td>
            <td class="label empty-label"></td>
            <td class="value empty-value"></td>
            <template v-if="formData.specialType !== 'J'">
              <td class="label empty-label"></td>
              <td class="value empty-value"></td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- 价格信息 -->
    <div class="section-title" @click="toggleSection('priceInfo', $event)">
      <div class="flex flex-1 items-center justify-start">
        <span class="remark"></span>价格信息
      </div>

      <AntdRightOutlined
        v-show="sectionCollapsed.priceInfo"
        class="toggle-icon"
      />
      <AntdDownOutlined
        v-show="!sectionCollapsed.priceInfo"
        class="toggle-icon"
      />
    </div>
    <div
      class="table-form"
      id="priceInfoForm"
      v-show="!sectionCollapsed.priceInfo"
    >
      <table class="info-table">
        <tbody>
          <!-- 第一行：统一定价、是否计价、后结算价格模式 、计费编码-->
          <tr>
            <td class="label">统一定价</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isPurchasePriceUnify"
                placeholder="请选择统一定价"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="getPopupContainer('priceInfoForm')"
              />
            </td>
            <td class="label">是否计价</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isFee"
                placeholder="请选择是否计价"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="getPopupContainer('priceInfoForm')"
              />
            </td>
            <td class="label">后结算价格模式</td>
            <td class="value">
              <ChcSelect
                v-model="formData.settlementPriceMode"
                dict-url="/baseHandleAction/refList.do?id=M_Product.SettlementPriceMode"
                placeholder="请选择后结算价格模式"
                class="w-full"
                :paginate="false"
                :immediate="true"
                :filter-by-front-end="true"
                :show-search="true"
                filter-field="label"
                :disabled="isViewMode"
                label-field="name"
                value-field="id"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
                :get-popup-container="getPopupContainer('priceInfoForm')"
              />
            </td>
            <td class="label">计费编码</td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.value2"
                size="small"
                placeholder="请输入计费编码"
                :disabled="isViewMode"
                :maxlength="32"
              />
            </td>
            <td class="label empty-label"></td>
            <td class="value empty-value"></td>
          </tr>
          <!-- 第二行：零售价、采购价格 -->
          <tr>
            <td class="label">零售价</td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.priceList"
                size="small"
                placeholder="请输入零售价"
                :disabled="isViewMode"
                :maxlength="20"
              />
            </td>
            <td class="label--require">
              <span class="text-red">*</span>采购价格
            </td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.pricePO"
                size="small"
                placeholder="请输入采购价格"
                :disabled="isViewMode"
                :maxlength="20"
              />
            </td>
            <td class="label--require">
              <span class="text-red">*</span> 最小单位精度
            </td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.baseUOMPrecision"
                size="small"
                placeholder="请输入最小单位精度"
                :disabled="isViewMode"
              />
            </td>
            <!-- <td class="label empty-label"></td>
            <td class="value empty-value"></td> -->
            <td class="label empty-label"></td>
            <td class="value empty-value"></td>
            <td class="label empty-label"></td>
            <td class="value empty-value"></td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- 平台信息  -->
    <div
      class="section-title"
      @click="toggleSection('provincialPlatform', $event)"
    >
      <div class="flex flex-1 items-center justify-start">
        <span class="remark"></span>平台信息
      </div>

      <AntdRightOutlined
        v-show="sectionCollapsed.provincialPlatform"
        class="toggle-icon"
      />
      <AntdDownOutlined
        v-show="!sectionCollapsed.provincialPlatform"
        class="toggle-icon"
      />
    </div>
    <div
      class="table-form"
      id="provincialPlatformForm"
      v-show="!sectionCollapsed.provincialPlatform"
    >
      <table class="info-table">
        <tbody>
          <!-- 第一行：是否上传省平台、省平台编码、是否市标 、市标编码-->
          <tr>
            <td class="label">是否上传省平台</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isBid"
                placeholder="是否上传省平台"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('provincialPlatformForm')
                "
              />
            </td>
            <td class="label">省平台编码</td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.markCode"
                size="small"
                placeholder="请输入省平台编码"
                :disabled="isViewMode"
                :maxlength="50"
              />
            </td>
            <td class="label">是否市标</td>
            <td class="value">
              <ChcSelect
                v-model="formData.isCityBid"
                placeholder="请选择是否市标"
                class="w-full"
                :paginate="false"
                :immediate="false"
                filter-field="label"
                label-field="label"
                value-field="value"
                :disabled="isViewMode"
                :options="[
                  {
                    label: '是',
                    value: 'Y',
                  },
                  {
                    label: '否',
                    value: 'N',
                  },
                ]"
                :get-popup-container="
                  getPopupContainer('provincialPlatformForm')
                "
              />
            </td>
            <td class="label">市标编码</td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.cityBidCode"
                size="small"
                placeholder="请输入市标编码"
                :disabled="isViewMode"
                :maxlength="50"
              />
            </td>
            <td class="label">阳光采购通用名</td>
            <td class="value">
              <ChcSelect
                :key="ygcgSelectKey"
                v-model="formData.ygcgProductNameId"
                dict-url="/ygcgProductNameAction/query"
                placeholder="请选择阳光采购通用名"
                class="w-full"
                :paginate="true"
                :immediate="true"
                :filter-by-front-end="false"
                :show-search="true"
                filter-field="productName"
                label-field="productName"
                value-field="productNameId"
                query-model-value-field="productNameId"
                :show-choose-all="false"
                :disabled="isViewMode"
                :get-popup-container="getPopupContainer('basicForm')"
                :after-fetch="
                  (res: any) => {
                    return { ...res, rows: undefined, records: res.rows };
                  }
                "
              />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 包装信息 -->
    <div class="section-title" @click="toggleSection('packageInfo', $event)">
      <div class="flex flex-1 items-center justify-start">
        <span class="remark"></span>包装信息
      </div>

      <AntdRightOutlined
        v-show="sectionCollapsed.packageInfo"
        class="toggle-icon"
      />
      <AntdDownOutlined
        v-show="!sectionCollapsed.packageInfo"
        class="toggle-icon"
      />
    </div>
    <div
      class="table-form"
      id="packageInfoForm"
      v-show="!sectionCollapsed.packageInfo"
    >
      <table class="info-table">
        <tbody>
          <!-- 第一行：中包装数、大包装数 -->
          <tr>
            <td class="label">中包装数</td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.mpackageQty"
                size="small"
                placeholder="请输入中包装数"
                :disabled="isViewMode"
                :maxlength="20"
              />
            </td>
            <td class="label">大包装数</td>
            <td class="value">
              <AntdInput
                allow-clear
                v-model:value="formData.lpackageQty"
                size="small"
                placeholder="请输入大包装数"
                :disabled="isViewMode"
                :maxlength="20"
              />
            </td>
            <td class="label empty-label"></td>
            <td class="value empty-value"></td>
            <td class="label empty-label"></td>
            <td class="value empty-value"></td>
            <td class="label empty-label"></td>
            <td class="value empty-value"></td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 按钮区域 -->
    <div
      v-if="false"
      class="form-buttons absolute bottom-0 left-0 right-0 flex h-[60px] items-center justify-center gap-[10px]"
    >
      <AntButton @click="handleBack">
        返回
        <AntdArrowLeftOutlined class="mb-[4px]" />
      </AntButton>

      <AntButton type="primary" @click="handleSave" v-show="!isViewMode">
        保存
        <template #icon>
          <UploadCloudIcon />
        </template>
      </AntButton>

      <AntButton type="primary" @click="handleSubmit" v-show="!isViewMode">
        提交
        <template #icon>
          <UploadCloudIcon />
        </template>
      </AntButton>
    </div>
  </div>
</template>

<style lang="less" scoped>
/* 表格样式的表单 */
.table-form {
  width: 100%;
  margin-bottom: 25px;
  box-sizing: border-box;
}

/* 包装信息模块 */
.table-form:last-of-type {
  margin-bottom: 10px;
}

.info-table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid #e6e6e6;
  background: #fff;
  table-layout: auto;
  box-shadow:
    0 1px 3px rgba(0, 0, 0, 0.06),
    0 2px 6px rgba(0, 0, 0, 0.04),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border-radius: 4px;
}

.info-table td {
  border: 1px solid #e6e6e6;
  padding: 4px 8px; /* 减小行高 */
  // vertical-align: middle;
  height: 32px; /* 减小行高 */
  box-sizing: border-box;
}

.info-table .label {
  background-color: #f5f7fa;
  font-weight: 500;
  color: #606266;
  text-align: center;
  font-size: 14px;
  /* 自适应宽度 */
  // width: auto;
  // min-width: 80px;
  // max-width: 120px;
  width: 10%;
  white-space: nowrap;
}
.info-table .label--require {
  background-color: #f5f7fa;
  font-weight: 500;
  text-align: center;
  // width: auto;
  // min-width: 80px;
  // max-width: 120px;
  width: 10%;
  font-size: 14px;
  text-align: center;
  white-space: nowrap;
  color: rgba(255, 0, 0, 0.651);
}
.info-table .value {
  background-color: #fff;
  // width: auto;
  // min-width: 120px;
  // max-width: 150px;
  // min-width: 80px;
  // max-width: 120px;
  width: 10%;
  max-width: 150px;
}

/* 空单元格样式 */
.info-table .empty-label {
  background-color: #f5f7fa;
  border: 1px solid #e6e6e6;
}

.info-table .empty-value {
  background-color: #fff;
  border: 1px solid #e6e6e6;
}

/* 固定底部按钮 */
.form-buttons {
  background: #fff;
  text-align: center;
  padding: 15px 0;
  border-top: 1px solid #e6e6e6;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

/* 响应式 */
@media (max-width: 1200px) {
  .info-table .label {
    // width: 100px;
    // min-width: 100px;
  }

  .info-table .value {
    // min-width: 120px;
    width: 100px;
  }
}

@media (max-width: 768px) {
  .form-container {
    /* 小屏幕减少内边距 */
    padding: 15px 15px 70px 15px;
  }

  .info-table {
    font-size: 14px;
  }

  .info-table .label {
    width: 80px;
    min-width: 80px;
    font-size: 14px;
  }

  .info-table .value {
    min-width: 100px;
  }

  .info-table td {
    padding: 6px 8px;
    height: 36px;
  }
}

/* 区域标题样式 */
.section-title {
  font-size: 15px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 5px 0;
  padding: 8px 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
  border-left: 1px solid #d7d8d8;
  /* 3D阴影效果 */
  box-shadow:
    0 2px 4px rgba(0, 0, 0, 0.1),
    0 4px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  display: flex;
  align-items: center;
  /* 防止文本选择 */
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
}

/* remark标记样式 */
.section-title .remark {
  width: 16px;
  height: 4px;
  background: #2b73e9;
  border-radius: 4px 4px 0 0;
  opacity: 1;
  transform: rotate(90deg);
  margin-right: 3px;
  margin-left: -10px;
  flex-shrink: 0;
}

/* 展开收起图标样式 */
.section-title .toggle-icon {
  color: #606266;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 3px;
}

.section-title .toggle-icon:hover {
  color: #2b73e9;
  background-color: rgba(43, 115, 233, 0.1);
  transform: scale(1.1);
}

/* section-title悬停效果 */
.section-title:hover {
  background-color: #f0f2f5;
  box-shadow:
    0 3px 6px rgba(0, 0, 0, 0.12),
    0 6px 12px rgba(0, 0, 0, 0.08);
}

.section-title:hover .toggle-icon {
  color: #2b73e9;
}

/* 物资图片上传样式 */
.picture-upload-cell {
  vertical-align: top !important;
  padding: 8px !important;
  width: 120px;
}

.picture-upload-container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .material-picture-uploader {
    ::v-deep .el-upload--picture-card {
      width: 80px;
      height: 80px;
      line-height: 80px;
      border: 1px dashed #d9d9d9;
      border-radius: 4px;
      background-color: #fafafa;
      margin: 0;

      &:hover {
        border-color: #409eff;
      }
    }

    .picture-uploader-icon {
      font-size: 24px;
      color: #8c939d;
    }
  }

  .picture-preview {
    width: 80px;
    height: 80px;
    border: 1px solid #d9d9d9;
    border-radius: 4px;
    overflow: hidden;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fafafa;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .picture-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s;
      cursor: pointer;

      &:hover {
        opacity: 1;
      }
      // .icon-delete {
      //   font-size: 18px;
      //   padding: 4px;
      //   color: #fff;
      //   box-sizing: content-box;
      //   &:hover {
      //     color: #f56c6c;
      //   }
      // }
    }
  }

  .no-picture {
    width: 80px;
    height: 80px;
    border: 1px dashed #d9d9d9;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fafafa;
    color: #8c939d;
    font-size: 12px;
  }
}
.label .upload-tip {
  margin-top: 8px;
  font-size: 10px;
  color: #8c939d;
  text-align: center;
  line-height: 1.2;
  // max-width: 120px;
  width: 100%;
  color: #0707079c;
  margin-top: 2px;
  font-size: 10px;
  white-space: normal;
  word-wrap: break-word;
  line-height: 1.2;
}
:deep(.ant-select-selector) {
  // height: 24px !important;
  width: 146px;
  height: 28px !important;
}
:deep(.ant-select-selection-search-input) {
  font-size: 14px;
  &::placeholder {
    font-size: 14px;
  }
}
// ant-select-selection-placeholder
:deep(.ant-select-selection-placeholder) {
  font-size: 14px !important;
}
:deep(.ant-input) {
  height: 26px;
}
</style>
