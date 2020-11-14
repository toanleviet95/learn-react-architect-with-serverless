const pad = n => n < 10 ? `0${n}` : n;

export const setDate = (d, hours) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours);

export const utcstring = d => (
  d.getUTCFullYear() + '-'
  + pad(d.getUTCMonth() + 1) + '-'
  + pad(d.getUTCDate()) + '-'
  + pad(d.getUTCHours())
);
