export default function convertDateToCzech(date) {
  if (date === null || date === '') {
    return '';
  }
  const pattern = /(\d{4})-(\d{2})-(\d{2})/;
  const matches = date.match(pattern);

  if (matches) {
    const czechDate = `${matches[3]}.${matches[2]}.${matches[1]}`;
    return czechDate; // Outputs: 22.09.2024
  }
  return date;
}
export const convertDateTimeToCzech = (dateTime) => {
  if (dateTime === null || dateTime === '') {
    return '';
  }
  const pattern = /(\d{4})-(\d{2})-(\d{2})(T|\s)(\d{2}):(\d{2}):(\d{2})/;
  let matches = dateTime.match(pattern);
  if (matches == null) {
    const pattern2 = /(\d{4})-(\d{2})-(\d{2})(T|\s)(\d{2}):(\d{2})/;
    matches = dateTime.match(pattern2);
  }

  if (matches) {
    // Convert to Czech date format DD.MM.YYYY HH:MM:SS
    const czechDateTime = `${matches[3]}.${matches[2]}.${matches[1]} ${matches[5]}:${matches[6]}`;
    return czechDateTime; // Outputs: 22.09.2024 14:30:00
  }
  return dateTime;
};

export const DateTimeComponent = (dateTime) => {
  console.log(dateTime);
  // Split the date and time parts
  const [datePart, timePart] = dateTime.split(' ');

  // Split the date into day, month, and year
  const [day, month, year] = datePart.split('.');

  // Combine into the desired format: YYYY-MM-DDTHH:MM
  const formattedDate = `${year}-${month}-${day}T${timePart}`;

  return formattedDate;
};

export const convertToMySQLDatetime = (datetimeLocal) => {
  // Replace dots with dashes
  let mysqlDatetime = datetimeLocal.replace(/\./g, '-');

  // Replace the 'T' with a space
  mysqlDatetime = mysqlDatetime.replace('T', ' ');

  // Split the date and time parts
  // const [datePart, timePart] = mysqlDatetime.split(' ');

  // Split the date into day, month, and year
  // const [day, month, year] = datePart.split('-');

  // Combine into the desired format: YYYY-MM-DD HH:MM:SS
  // mysqlDatetime = `${year}-${month}-${day} ${timePart}`;
  // Add seconds if not present
  if (mysqlDatetime.length === 16) {
    mysqlDatetime += ':00';
  }

  console.log(mysqlDatetime);

  return mysqlDatetime;
};
