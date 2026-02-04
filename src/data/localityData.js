// Bangalore Locality Data with Census 2011 Metrics & BWSSB Info
// Re-exporting from censusApi for backward compatibility
import { CENSUS_LOCALITY_DATA, getLocalityNames as getNames } from '../services/censusApi';

export const LOCALITY_DATA = CENSUS_LOCALITY_DATA;

export const getLocalityNames = getNames;
