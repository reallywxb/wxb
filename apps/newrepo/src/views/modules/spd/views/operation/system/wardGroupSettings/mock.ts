// AI-GENERATED-BEGIN
// @date 2026-03-30
// @prompt 创建病区组配置页面的 mock 数据
// @description 包含病区组列表和病区列表的模拟数据
import type { Ward, WardGroup } from './types';

/**
 * 病区组列表 mock 数据
 * wardIds 为已绑定病区 ID 数组
 */
export const mockWardGroupList: WardGroup[] = [
  {
    dictValue: '1',
    groupName: '内科病区组',
    deptCount: 4,
    wardIds: ['1', '2', '3', '4'],
  },
  {
    dictValue: '2',
    groupName: '外科病区组',
    deptCount: 2,
    wardIds: ['5', '6'],
  },
  { dictValue: '3', groupName: '儿科病区组', deptCount: 1, wardIds: ['7'] },
  {
    dictValue: '4',
    groupName: 'ICU 病区组',
    deptCount: 2,
    wardIds: ['9', '10'],
  },
  { dictValue: '5', groupName: '妇产科病区组', deptCount: 0, wardIds: [] },
  { dictValue: '6', groupName: '急诊病区组', deptCount: 1, wardIds: ['13'] },
  { dictValue: '7', groupName: '神经科病区组', deptCount: 0, wardIds: [] },
  { dictValue: '8', groupName: '肿瘤科病区组', deptCount: 0, wardIds: [] },
];

/**
 * 病区列表 mock 数据
 */
export const mockWardList: Ward[] = [
  { id: '1', deptName: '内科一病区', deptCode: 'NK01', value: '1' },
  { id: '2', deptName: '内科二病区', deptCode: 'NK02', value: '2' },
  { id: '3', deptName: '内科三病区', deptCode: 'NK03', value: '3' },
  { id: '4', deptName: '外科一病区', deptCode: 'WK01', value: '4' },
  { id: '5', deptName: '外科二病区', deptCode: 'WK02', value: '5' },
  { id: '6', deptName: '外科三病区', deptCode: 'WK03', value: '6' },
  { id: '7', deptName: '儿科病区', deptCode: 'EK01', value: '7' },
  { id: '8', deptName: '新生儿病区', deptCode: 'XSE01', value: '8' },
  { id: '9', deptName: '综合 ICU', deptCode: 'ICU01', value: '9' },
  { id: '10', deptName: '外科 ICU', deptCode: 'ICU02', value: '10' },
  { id: '11', deptName: '妇科病区', deptCode: 'FK01', value: '11' },
  { id: '12', deptName: '产科病区', deptCode: 'CK01', value: '12' },
  { id: '13', deptName: '急诊观察区', deptCode: 'JZ01', value: '13' },
  { id: '14', deptName: '急诊抢救区', deptCode: 'JZ02', value: '14' },
  { id: '15', deptName: '神经内科病区', deptCode: 'SJ01', value: '15' },
  { id: '16', deptName: '神经外科病区', deptCode: 'SJ02', value: '16' },
  { id: '17', deptName: '肿瘤一病区', deptCode: 'ZL01', value: '17' },
  { id: '18', deptName: '肿瘤二病区', deptCode: 'ZL02', value: '18' },
];
// AI-GENERATED-END
