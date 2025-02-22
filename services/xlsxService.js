import dayjs from 'dayjs';
import xlsx from 'node-xlsx';

import { getHoursInjection } from './hoursService.js';

export async function getHoursXlsx(
  season_start = dayjs('2024-12-30').tz().startOf('day')
) {
  const promises = [];
  for (
    let s = season_start;
    s.add(2, 'weeks').isBefore(dayjs().tz());
    s = s.add(1, 'week')
  ) {
    const start = s;
    const end = start.add(2, 'weeks');
    promises.push(
      getHoursInjection(start, end).then(({ people, window }) => {
        const start = window.start.format('YYYY-MM-DD');
        const end = window.end.format('YYYY-MM-DD');
        const data = people.map((person) => [person.name, person.hours]);
        data.unshift(['Total', window.hours.toFixed(2)]);
        data.push(
          ['75% of Total', (window.hours * 0.75).toFixed(2)],
          ['66% of Total', (window.hours * 0.66).toFixed(2)]
        );
        data.sort((a, b) => b[1] - a[1]);
        data.unshift(['Name', `Hours (${start} to ${end})`]);
        return {
          name: `${start} to ${end}`,
          data,
        };
      })
    );
  }

  const sheets = await Promise.all(promises);
  const filename = `hours_${season_start.format('YYYY-MM-DD')}_${dayjs()
    .tz()
    .startOf('week')
    .subtract(1, 'day')
    .format('YYYY-MM-DD')}.xlsx`;
  return {
    filename,
    buffer: xlsx.build(sheets, {
      sheetOptions: { '!cols': [{ wch: 25 }, { wch: 5 }] },
    }),
  };
}
