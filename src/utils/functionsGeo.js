import * as turf from '@turf/turf';

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

export function geometryCheck(geom) {
  try {
    geom = turf.rewind(geom);
    geom = turf.simplify(geom, { tolerance: 0.000001, highQuality: false });
    geom = turf.cleanCoords(geom);

    if (turf.kinks(geom).features.length > 0) {
      //si tiene nudos
      let unkink = turf.unkinkPolygon(geom);
      let array = [];
      turf.flattenEach(unkink, function(
        currentFeature,
        featureIndex,
        multiFeatureIndex
      ) {
        array.push(currentFeature.geometry.coordinates);
      });
      geom = turf.multiPolygon(array);
    }

    if (geom.geometry.type == 'MultiPolygon') {
      //limpiar geometrias con menos de 100mts2 (ej: lineas entre lotes)
      geom = cleanGeometries(geom, 100);
    }

    if (
      geom.geometry.type != 'MultiPolygon' &&
      geom.geometry.type != 'Polygon'
    ) {
      throw 'No es poligono ni multipoligono.';
    }

    if (!turf.buffer(geom, 0)) throw 'La geometria no es valida.';

    if (turf.area(geom) < 100)
      throw 'La geometria debe tener como minimo 100mts2.';

    return geom;
  } catch (e) {
    console.log(e);
  }
}

export function cleanGeometries(geom, mts) {
  var array = [];
  turf.flattenEach(geom, function(
    currentFeature,
    featureIndex,
    multiFeatureIndex
  ) {
    var area = turf.area(currentFeature);
    if (area >= mts) {
      array.push(currentFeature.geometry.coordinates);
    }
  });
  return turf.multiPolygon(array);
}

export function unionAll(drawGeom, defaultGeom) {
  let union = turf.union(drawGeom, defaultGeom);
  return union;
}

export function cutAll(drawGeom, defaultGeom) {
  var count = 0;
  var cantgeom = 0;
  turf.flattenEach(defaultGeom, function(currentFeature) {
    cantgeom++;
    if (drawGeom.geometry.type == 'MultiPolygon') {
      turf.flattenEach(drawGeom, function(currentFeatureDraw) {
        if (turf.booleanContains(currentFeatureDraw, currentFeature)) {
          count++;
        }
      });
    } else {
      if (turf.booleanContains(drawGeom, currentFeature)) {
        count++;
      }
    }
  });

  /*if (count == cantgeom) {
    //eliminar todo
    map.editTools.featuresLayer.clearLayers();
    return;
  }*/

  let cut = turf.difference(defaultGeom, drawGeom);
  return cut;
}

export function unify(polyList) {
  var unionTemp = undefined;
  turf.flattenEach(polyList, function(
    currentFeature,
    featureIndex,
    multiFeatureIndex
  ) {
    if (multiFeatureIndex == 0) {
      unionTemp = currentFeature;
    } else {
      unionTemp = turf.union(unionTemp, currentFeature);
    }
  });

  return unionTemp;
}

export function polygonCut(polygon, line) {
  const THICK_LINE_UNITS = 'kilometers';
  const THICK_LINE_WIDTH = 0.0001;
  var i, j, id, intersectPoints, lineCoords, forCut, forSelect;
  var thickLineString, thickLinePolygon, clipped, polyg, intersect;
  var polyCoords = [];
  var cutPolyGeoms = [];
  var cutFeatures = [];
  var offsetLine = [];
  var retVal = null;

  if (
    (polygon.type != 'Polygon' && polygon.type != 'MultiPolygon') ||
    line.type != 'LineString'
  ) {
    return retVal;
  }

  intersectPoints = turf.lineIntersect(polygon, line);
  if (intersectPoints.features.length == 0) {
    return retVal;
  }

  var lineCoords = turf.getCoords(line);
  if (
    turf.booleanWithin(turf.point(lineCoords[0]), polygon) ||
    turf.booleanWithin(turf.point(lineCoords[lineCoords.length - 1]), polygon)
  ) {
    return retVal;
  }

  offsetLine[0] = turf.lineOffset(line, THICK_LINE_WIDTH, {
    units: THICK_LINE_UNITS
  });
  offsetLine[1] = turf.lineOffset(line, -THICK_LINE_WIDTH, {
    units: THICK_LINE_UNITS
  });

  for (i = 0; i <= 1; i++) {
    forCut = i;
    forSelect = (i + 1) % 2;
    polyCoords = [];
    for (j = 0; j < line.coordinates.length; j++) {
      polyCoords.push(line.coordinates[j]);
    }
    for (j = offsetLine[forCut].geometry.coordinates.length - 1; j >= 0; j--) {
      polyCoords.push(offsetLine[forCut].geometry.coordinates[j]);
    }
    polyCoords.push(line.coordinates[0]);

    thickLineString = turf.lineString(polyCoords);
    thickLinePolygon = turf.lineToPolygon(thickLineString);
    console.log(thickLinePolygon);
    clipped = turf.difference(polygon, thickLinePolygon);

    cutPolyGeoms = [];
    for (j = 0; j < clipped.geometry.coordinates.length; j++) {
      polyg = turf.polygon(clipped.geometry.coordinates[j]);
      intersect = turf.lineIntersect(polyg, offsetLine[forSelect]);
      if (intersect.features.length > 0) {
        cutPolyGeoms.push(polyg.geometry.coordinates);
      }
    }

    cutPolyGeoms.forEach(function(geometry, index) {
      cutFeatures.push(turf.polygon(geometry));
    });
  }

  //if (cutFeatures.length > 0) retVal = turf.featureCollection(cutFeatures);

  return cutFeatures;
}
