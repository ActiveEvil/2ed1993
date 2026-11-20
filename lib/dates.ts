const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const publishedLabel = (
  year: number | null,
  month: number | null,
): string | null => {
  if (!year) {
    return null;
  }

  const name = month ? MONTHS[month - 1] : undefined;

  return name ? `${name} ${year}` : `${year}`;
};
