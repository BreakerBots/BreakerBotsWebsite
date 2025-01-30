import xlsx from 'node-xlsx';

import { getHoursInjection } from './hoursService.js';

export async function getHoursXlsx() {
  const { people, window } = await getHoursInjection();
  let start = window.start.format('MM-DD');
  let end = window.end.format('MM-DD');
  const filename = `hours_${start}_${end}.xlsx`;
  start = start.replace('-', '/');
  end = end.replace('-', '/');
  const data = people.map((person) => [person.name, person.hours]);
  data.unshift(['Total', window.hours]);
  data.push(
    ['75% of Total', window.hours * 0.75],
    ['66% of Total', window.hours * 0.66]
  );
  data.sort((a, b) => b[1] - a[1]);
  data.unshift(['Name', `Hours (${start} – ${end})`]);
  return {
    filename,
    buffer: xlsx.build(
      [
        {
          name: 'Hours',
          data,
        },
      ],
      { sheetOptions: { '!cols': [{ wch: 25 }, { wch: 5 }] } }
    ),
  };
}
