import * as ExcelJS from 'exceljs';
import axios from 'axios';

export const generateExcelFromTemplate = async (
  templateUrl: string,
  payload: { rows: any[]; add_names: string[] }
): Promise<Buffer> => {
  const { rows, add_names } = payload;

  // 1. Tải file template từ Cloud
  const response = await axios.get(templateUrl, { responseType: 'arraybuffer' });
  const buffer = Buffer.from(response.data, 'binary');

  // 2. Load bằng ExcelJS
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.worksheets[0]; // Lấy sheet đầu tiên

  // 3. Dò tìm các biến vị trí
  let headerRowIdx = -1;
  let dataRowIdx = -1;
  let addColIdx = -1;

  // Quét toàn bộ để tìm {{add_name}} và dòng data
  worksheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      const val = cell.value?.toString() || '';
      if (val.includes('{{add_name}}')) {
        headerRowIdx = rowNumber;
        addColIdx = colNumber;
      }
      if (val.includes('{{date}}')) {
        dataRowIdx = rowNumber;
      }
    });
  });

  // Nếu không tìm thấy {{add_name}}, giả sử rơi vào trường hợp template cũ hoặc fallback tĩnh
  // Chúng ta vẫn có thể tiếp tục đổ data tĩnh.
  if (headerRowIdx !== -1 && addColIdx !== -1 && add_names.length > 0) {
    // 4. Insert thêm cột ngang hàng nếu add_names > 1
    const colsToInsert = add_names.length - 1;
    if (colsToInsert > 0) {
      // ExcelJS spliceColumns: start, deleteCount, ...insert
      // Để copy style, ta lấy column cũ. Nhưng spliceColumns của ExcelJS không copy style dễ dàng.
      // Giải pháp: Thêm cột trống, sau đó copy từng cell.
      
      const emptyCols = new Array(colsToInsert).fill([]);
      worksheet.spliceColumns(addColIdx + 1, 0, ...emptyCols);
      
      // Copy width
      const originalCol = worksheet.getColumn(addColIdx);
      for (let i = 1; i <= colsToInsert; i++) {
        worksheet.getColumn(addColIdx + i).width = originalCol.width;
      }

      // Copy styles cho tất cả các row hiện tại trong cột đó
      worksheet.eachRow((row) => {
        const sourceCell = row.getCell(addColIdx);
        for (let i = 1; i <= colsToInsert; i++) {
          const targetCell = row.getCell(addColIdx + i);
          targetCell.style = sourceCell.style;
          
          // Xóa text trong target cell nếu nó không phải là biến giữ chỗ
          // Nếu nó là biến giữ chỗ thì copy luôn để lát đè data
          targetCell.value = sourceCell.value; 
        }
      });
      
      // Fix merged cells nếu bị ảnh hưởng (ExcelJS tự động handle một phần, nhưng có thể cần adjust)
    }

    // 5. Điền tên chất bổ sung vào Header
    const headerRow = worksheet.getRow(headerRowIdx);
    add_names.forEach((name, idx) => {
      headerRow.getCell(addColIdx + idx).value = name;
    });
  }

  // 6. Đổ dữ liệu hàng (Rows)
  if (dataRowIdx !== -1) {
    const templateRow = worksheet.getRow(dataRowIdx);
    
    // Lưu lại cấu hình biến của dòng template
    const placeholders: Array<{ col: number; key: string }> = [];
    templateRow.eachCell((cell, colNumber) => {
      const val = cell.value?.toString() || '';
      if (val.startsWith('{{') && val.endsWith('}}')) {
        placeholders.push({ col: colNumber, key: val.replace(/[{}]/g, '') });
      }
    });

    // Tạo đủ số lượng dòng (insert thêm dòng nếu cần)
    const rowsToAdd = rows.length - 1; // Vì template đã chiếm 1 dòng
    if (rowsToAdd > 0) {
      // Dùng hàm duplicateRow của exceljs (có trong thư viện) hoặc tự copy
      worksheet.duplicateRow(dataRowIdx, rowsToAdd, true);
    }

    // Điền dữ liệu
    rows.forEach((rowData, idx) => {
      const currentRow = worksheet.getRow(dataRowIdx + idx);
      
      // Duyệt qua các placeholders để điền
      placeholders.forEach(ph => {
        const cell = currentRow.getCell(ph.col);
        
        // Nếu biến là add_amt, nó nằm ở col gốc.
        // Nhưng nếu cột đã bị nhân bản thì sao?
        // Ở bước trên ta đã copy cell có chứa {{add_amt}} ra N cột.
        // Bây giờ ta duyệt lại các cell trên currentRow xem có chữ {{add_amt}} không.
        
        // Lấy value hiện tại (có thể là {{add_amt}})
        const cellVal = cell.value?.toString() || '';
      });

      // Cách tốt nhất để điền data row: Duyệt TẤT CẢ các cell của currentRow
      currentRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        const val = cell.value?.toString() || '';
        if (val.startsWith('{{') && val.endsWith('}}')) {
          const key = val.replace(/[{}]/g, '');
          
          if (key === 'add_amt') {
            // Xác định chất bổ sung ở cột này là gì
            // Nhìn lên headerRowIdx ở cùng cột
            if (headerRowIdx !== -1) {
              const headerName = worksheet.getRow(headerRowIdx).getCell(colNumber).value?.toString();
              if (headerName) {
                // rowData có add_amt_1, add_amt_2... nhưng ở đây ta mapping bằng index của add_names
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
          } else {
            // Các biến khác như {{date}}, {{ph}}...
            cell.value = rowData[key] !== undefined && rowData[key] !== null ? rowData[key] : '';
          }
        }
      });
      currentRow.commit();
    });
  }

  // Xuất file ra Buffer
  const outBuffer = await workbook.xlsx.writeBuffer();
  return outBuffer as Buffer;
};
