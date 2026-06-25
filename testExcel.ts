import * as ExcelJS from 'exceljs';

async function test() {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Test');
  
  ws.getCell('D3').value = 'Hello';
  ws.mergeCells('D3:D4');
  
  ws.getCell('C2').value = 'Header';
  ws.mergeCells('C2:E2');
  
  const oldMerges = [...(ws.model.merges || [])];
  oldMerges.forEach(m => {
     try { ws.unMergeCells(m); } catch (e) {}
  });

  const I = 5; // Insert at E
  const K = 2; // Insert 2 columns
  
  ws.spliceColumns(I, 0, [], []); 
  
  // Recalculate and re-merge
  oldMerges.forEach(mergeStr => {
    const [tl, br] = mergeStr.split(':');
    const tlCell = ws.getCell(tl);
    const brCell = ws.getCell(br);
    
    let c1 = Number(tlCell.col);
    let c2 = Number(brCell.col);
    const r1 = Number(tlCell.row);
    const r2 = Number(brCell.row);
    
    if (c1 >= I) c1 += K;
    if (c2 >= I) c2 += K;
    
    ws.mergeCells(r1, c1, r2, c2);
    
    if (Number(tlCell.col) === 4 && Number(brCell.col) === 4) {
       for (let k = 1; k <= K; k++) {
          ws.mergeCells(r1, 4 + k, r2, 4 + k);
       }
    }
  });

  console.log('After Splice:', ws.model.merges);
}

test().catch(console.error);
