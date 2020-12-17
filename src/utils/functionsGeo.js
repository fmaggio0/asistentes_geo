export function convertDegToDms(dd, longOrLat) {
  let hemisphere = /^[WE]|(?:lon)/i.test(longOrLat)
    ? dd < 0
      ? 'W'
      : 'E'
    : dd < 0
    ? 'S'
    : 'N';

  const absDD = Math.abs(dd);
  const degrees = truncate(absDD);
  const minutes = truncate((absDD - degrees) * 60);
  const seconds = ((absDD - degrees - minutes / 60) * Math.pow(60, 2)).toFixed(
    2
  );

  let dmsArray = [degrees, minutes, seconds, hemisphere];
  return `${dmsArray[0]}°${dmsArray[1]}'${dmsArray[2]}" ${dmsArray[3]}`;
}

export function convertDmsToDeg(dms) {
  var dms_Array = dms.split(/[^\d\w\.]+/);
  var degrees = dms_Array[0];
  var minutes = dms_Array[1];
  var seconds = dms_Array[2];
  var direction = dms_Array[3];

  var deg = (
    Number(degrees) +
    Number(minutes) / 60 +
    Number(seconds) / 3600
  ).toFixed(6);

  if (direction == 'S' || direction == 'W') {
    deg = deg * -1;
  } // Don't do anything for N or E
  return deg;
}

export function truncate(n) {
  return n > 0 ? Math.floor(n) : Math.ceil(n);
}

export function checkFormatDms(lng, lat) {
  let regLng = /^[\+-]?(([0-9]|[0-9][0-9]|[0-1][0-8][0-9]?\d)[°]+([1-5]?\d|60)[']+(([1-5]?\d|60)|([1-5]?\d|60)(\.\d+))["](|180\D+0\D+0))?(\D+?$)?[EWew]/;
  let regLat = /^[\+-]?(([1-8]?\d)[°]+([1-5]?\d|60)[']+(([1-5]?\d|60)|([1-5]?\d|60)(\.\d+))["](|90\D+0\D+0))?(\D+?$)?[NSns]/;

  let latClear = lat.replace(/ /g, '');
  let lngClear = lng.replace(/ /g, '');

  if (!regLng.exec(lngClear) || !regLat.exec(latClear)) return false;

  return [latClear, lngClear];
}

export function checkFormatLongLat(lng, lat) {
  let regLng = /^(\+|-)?(?:180(?:(?:\.0{1,16})?)|(?:[0-9]|[1-9][0-9]|1[0-7][0-9])(?:(?:\.[0-9]{1,16})?))$/;
  let regLat = /^(\+|-)?(?:90(?:(?:\.0{1,16})?)|(?:[0-9]|[1-8][0-9])(?:(?:\.[0-9]{1,16})?))$/;

  let latClear = lat.toString().replace(/ /g, '');
  let lngClear = lng.toString().replace(/ /g, '');

  if (!regLng.exec(lngClear) || !regLat.exec(latClear)) return false;

  return [latClear, lngClear];
}
