import { Feature } from 'geojson';

// Copy the properties in propertyKeys from the fromFeatures to toFeatures using the idKey as key
export function copyProperties(
  toFeatures: Feature[],
  fromFeatures: Feature[],
  propertyKeys: string[],
  idKey: string,
  prefix?: string,
  postfix?: string
) {
  try {
    // put all properties in a map
    const propertyMap = {};
    for (const fromFeature of fromFeatures) {
      propertyMap[fromFeature.properties[idKey]] = fromFeature.properties;
    }
    // assign the properties to the features
    for (const toFeature of toFeatures) {
      const fromProperties = propertyMap[toFeature.properties[idKey]];
      // if properties in fromFeatures was found for this toFeature
      if (fromProperties) {
        for (const propertyKey of propertyKeys) {
          const value = fromProperties[propertyKey];
          if (value || value === 0) {
            toFeature.properties[`${prefix}${propertyKey}${postfix}`] = value;
          }
        }
      }
    }
    return toFeatures;
  } catch (err) {
    console.warn('Error in copyProperties function', err);
  }
}

// Add a new property key/value according to some logic in the features
export function addProperty(
  toFeatures: Feature[],
  newPropertyKey: string,
  fn: (feature: Feature) => any
) {
  if (typeof newPropertyKey !== 'string') {
    return console.log('newPropertyKey needs to be a string');
  }
  for (const toFeature of toFeatures) {
    toFeature.properties[newPropertyKey] = fn(toFeature);
  }
  return toFeatures;
}
