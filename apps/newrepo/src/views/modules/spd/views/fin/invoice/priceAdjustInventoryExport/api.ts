import { requestFormClient } from '#/api/request';

export const modifyInovoiceNo = (params: any) => {
  return requestFormClient.post<any>(
    '/invoiceAction/updateTaxInvoiceNo',
    params,
  );
};
