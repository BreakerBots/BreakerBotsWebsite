import xlsx from 'node-xlsx';

import { getHoursInjection } from './hoursService.js';

export async function getHoursXlsx() {
  getHoursInjection().then(({ people, window }) => {
    const start = window.start.format('MM-DD');
    const end = window.end.format('MM-DD');
    const filename = `hours_${start}_${end}.xlsx`;
    return {
      filename,
      buffer: xlsx.build([
        {
          name: 'Hours',
          data: [
            ['Column 1', 'Column 2', 'Column 3'],
            [1, 'A', 10],
            [2, 'B', 20],
            [3, 'C', 30],
          ],
        },
      ]),
    };
  });
}
