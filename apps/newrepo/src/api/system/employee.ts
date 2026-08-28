import { requestClient } from '#/api/request';

export async function createEmployee(data: any) {
  return requestClient.post('/datatable/data/create/sys.employee', data);
}

export async function updateEmployee(data: any) {
  return requestClient.post('/datatable/data/update/sys.employee', data);
}

export async function delEmployee(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.employee', { id });
}

export async function createEmployeePartTime(data: any) {
  return requestClient.post(
    '/datatable/data/create/sys.employeePartTime',
    data,
  );
}

export async function updateEmployeePartTime(data: any) {
  return requestClient.post(
    '/datatable/data/update/sys.employeePartTime',
    data,
  );
}

export async function delEmployeePartTime(id: number | string) {
  return requestClient.post('/datatable/data/delete/sys.employeePartTime', {
    id,
  });
}
