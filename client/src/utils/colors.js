export const getColorForValue = (value) => {
    if (value == 10) return 'magenta';
    if (value == 8) return 'blue';
    if (value == 6) return 'green';
    if (value == 4) return 'orange';
    if (value == 2) return 'red';
    return 'black';
};