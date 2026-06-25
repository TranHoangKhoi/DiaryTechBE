import axios from 'axios';
import * as ExcelJS from 'exceljs';

/**
 * Tải file template Excel từ URL về Buffer
 */
export const downloadTemplate = async (url: string): Promise<Buffer> => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    return Buffer.from(response.data, 'binary');
  } catch (error) {
    console.error('Lỗi khi tải file mẫu từ File Server:', error);
    throw new Error('Không thể tải file mẫu. Vui lòng kiểm tra lại cấu hình mẫu báo cáo.');
  }
};

/**
 * Render Excel sử dụng thư viện ExcelJS (Hỗ trợ chèn cột động và giữ nguyên Format)
 */
export const renderExcel = async (
  templateBuffer: any,
  payload: { rows: any[]; add_names: string[]; first_feed_name?: string },
  paddingCount: number
): Promise<Buffer> => {
  const { rows, add_names, first_feed_name } = payload;

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(templateBuffer);
  const worksheet = workbook.worksheets[0];

  let headerRowIdx = -1;
  let dataRowIdx = -1;
  let addColIdx = -1;

  // Dò tìm vị trí {{add_name}} và {{date}}
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      const val = cell.value?.toString() || '';
      if (val.includes('{{add_name}}')) {
        headerRowIdx = rowNumber;
        addColIdx = colNumber;
      }
      if (val.includes('{{date}}') || val.includes('{{event_time}}') || val.includes('{{stt}}')) {
        dataRowIdx = rowNumber;
      }
    });
  });

  const globals = rows.length > 0 ? rows[0] : {};

  // 1. Chèn thêm Cột Động cho Chất Bổ Sung
  if (headerRowIdx !== -1 && addColIdx !== -1 && add_names.length > 0) {
    const colsToInsert = add_names.length - 1;
    if (colsToInsert > 0) {
      // Fix merges in ExcelJS manually since spliceColumns doesn't shift them automatically
      const oldMerges = [...(worksheet.model.merges || [])];
      oldMerges.forEach((m) => {
        try {
          worksheet.unMergeCells(m);
        } catch (e) {
          console.log(e);
        }
      });

      const emptyCols = new Array(colsToInsert).fill([]);
      worksheet.spliceColumns(addColIdx + 1, 0, ...emptyCols);

      // Recalculate and re-merge
      oldMerges.forEach((mergeStr) => {
        const [tl, br] = mergeStr.split(':');
        const tlCell = worksheet.getCell(tl);
        const brCell = worksheet.getCell(br);

        let c1 = Number(tlCell.col);
        let c2 = Number(brCell.col);
        const r1 = Number(tlCell.row);
        const r2 = Number(brCell.row);

        // Cập nhật vị trí cột nếu nằm sau đoạn splice
        if (c1 > addColIdx) c1 += colsToInsert;
        if (c2 > addColIdx) c2 += colsToInsert;

        worksheet.mergeCells(r1, c1, r2, c2);

        // Nếu đây là merge dọc hoàn toàn (ví dụ Row 3,4) nằm ngay tại cột {{add_name}}
        // thì ta nhân bản merge này sang các cột vừa chèn
        if (Number(tlCell.col) === addColIdx && Number(brCell.col) === addColIdx) {
          for (let k = 1; k <= colsToInsert; k++) {
            worksheet.mergeCells(r1, addColIdx + k, r2, addColIdx + k);
          }
        }
      });

      const originalCol = worksheet.getColumn(addColIdx);
      for (let i = 1; i <= colsToInsert; i++) {
        worksheet.getColumn(addColIdx + i).width = originalCol.width;
      }

      worksheet.eachRow((row) => {
        const sourceCell = row.getCell(addColIdx);
        for (let i = 1; i <= colsToInsert; i++) {
          const targetCell = row.getCell(addColIdx + i);
          targetCell.style = sourceCell.style;
          targetCell.value = sourceCell.value;
        }
      });
    }

    // Điền tên chất bổ sung vào Header
    const headerRow = worksheet.getRow(headerRowIdx);
    add_names.forEach((name, idx) => {
      headerRow.getCell(addColIdx + idx).value = name;
    });
  }

  // 2. Padding thêm dòng rỗng nếu cấu hình yêu cầu
  if (rows.length < paddingCount) {
    const padSize = paddingCount - rows.length;
    for (let i = 0; i < padSize; i++) {
      rows.push({}); // Thêm object rỗng
    }
  }

  // 3. Đổ Dữ Liệu Hàng (Rows)
  if (dataRowIdx !== -1) {
    const templateRow = worksheet.getRow(dataRowIdx);

    // Lưu lại vị trí các biến {{...}}
    const placeholders: Array<{ col: number; key: string }> = [];
    templateRow.eachCell((cell, colNumber) => {
      const val = cell.value?.toString() || '';
      if (val.startsWith('{{') && val.endsWith('}}')) {
        placeholders.push({ col: colNumber, key: val.replace(/[{}]/g, '') });
      }
    });

    const rowsToAdd = rows.length - 1;
    if (rowsToAdd > 0) {
      worksheet.duplicateRow(dataRowIdx, rowsToAdd, true);
    }

    rows.forEach((rowData, idx) => {
      const currentRow = worksheet.getRow(dataRowIdx + idx);

      currentRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        let val = '';
        if (
          cell.type === ExcelJS.ValueType.RichText &&
          cell.value &&
          (cell.value as ExcelJS.CellRichTextValue).richText
        ) {
          val = (cell.value as ExcelJS.CellRichTextValue).richText.map((rt) => rt.text).join('');
        } else {
          val = cell.value?.toString() || '';
        }

        if (val.includes('{{') && val.includes('}}')) {
          if (val === '{{add_amt}}') {
            if (headerRowIdx !== -1) {
              const headerName = worksheet.getRow(headerRowIdx).getCell(colNumber).value?.toString();
              if (headerName) {
                const addIdx = add_names.indexOf(headerName);
                if (addIdx !== -1) {
                  cell.value = rowData[`add_amt_${addIdx + 1}`] || '';
                } else {
                  cell.value = '';
                }
              } else {
                cell.value = '';
              }
            } else {
              cell.value = '';
            }
            return;
          }

          let replacedVal = val;
          const matches = val.match(/{{(.*?)}}/g);
          if (matches) {
            matches.forEach((match) => {
              const key = match.replace(/[{}]/g, '').trim();
              if (key === 'stt') {
                replacedVal = replacedVal.replace(match, (idx + 1).toString());
              } else {
                const dataVal = rowData[key] !== undefined && rowData[key] !== null ? rowData[key] : '';
                replacedVal = replacedVal.replace(match, dataVal.toString());
              }
            });
          }

          if (replacedVal.trim() === '') {
            cell.value = '';
          } else {
            const numVal = Number(replacedVal);
            if (!isNaN(numVal)) {
              cell.value = numVal;
            } else {
              cell.value = replacedVal;
            }
          }
        }
      });
      currentRow.commit();
    });
  }

  // 4. Quét lại toàn bộ sheet để replace các biến Global (như farm_owner_name, first_feed_name)
  // Các biến này có thể nằm ở Header (trước dataRowIdx) hoặc Footer
  worksheet.eachRow((row, rowNumber) => {
    // Bỏ qua vùng Data vì vùng data đã được xử lý ở bước 3
    if (dataRowIdx !== -1 && rowNumber >= dataRowIdx && rowNumber < dataRowIdx + rows.length) return;

    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      let val = '';
      if (
        cell.type === ExcelJS.ValueType.RichText &&
        cell.value &&
        (cell.value as ExcelJS.CellRichTextValue).richText
      ) {
        val = (cell.value as ExcelJS.CellRichTextValue).richText.map((rt) => rt.text).join('');
      } else {
        val = cell.value?.toString() || '';
      }

      if (val.includes('{{') && val.includes('}}')) {
        let replacedVal = val;
        // Xử lý biến cũ (first_feed_name) nếu còn xót
        if (replacedVal.includes('{{first_feed_name}}')) {
          replacedVal = replacedVal.replace('{{first_feed_name}}', first_feed_name || '');
        }

        const matches = replacedVal.match(/{{(.*?)}}/g);
        if (matches) {
          matches.forEach((match) => {
            const key = match.replace(/[{}]/g, '').trim();
            const dataVal = globals[key] !== undefined && globals[key] !== null ? globals[key] : '';
            replacedVal = replacedVal.replace(match, dataVal.toString());
          });
        }

        if (replacedVal.trim() === '') {
          cell.value = '';
        } else {
          const numVal = Number(replacedVal);
          if (!isNaN(numVal) && val !== replacedVal) {
            cell.value = numVal;
          } else {
            cell.value = replacedVal;
          }
        }
      }
    });
    row.commit();
  });

  const outBuffer = await workbook.xlsx.writeBuffer();
  return outBuffer as unknown as Buffer;
};
