const Translate = (column) => {
  switch (column) {
    case 'description':
      return 'Popis';
    case 'time_start':
      return 'Datum a čas';
    default:
      return column;
  }
};
export default Translate;
