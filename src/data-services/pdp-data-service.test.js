import map from 'lodash/fp/map';
import escapeRegExp from 'lodash/fp/escapeRegExp';

import {
  date2pdpFormat,
  networkSelectorOptions2pdpFormat,
  variable2PdpVariableIdentifier,
  variableSelectorOptions2pdpFormat,
  frequencyOptions2pdpFormat, dataDownloadTarget
} from './pdp-data-service';


describe('date2pdpFormat', () => {
  it('works for null date', () => {
    expect(date2pdpFormat(null)).toBe('');
  });

  it.each([
    [2000, 1, 1, '2000/01/01'],
    [2000, 10, 1, '2000/10/01'],
    [2000, 10, 10, '2000/10/10'],
  ])('works for %i/%i/%i', (year, month, day, expected) => {
    expect(date2pdpFormat(new Date(year, month-1, day))).toBe(expected);
  });
});


const networkOption = name => ({ value: { name }, foo: 'bar' });

describe('networkSelectorOptions2pdpFormat', () => {
  const allNetworks = map(networkOption)(['alpha', 'beta', 'gamma']);

  it.each([
    [ [], '' ],
    [ ['alpha'], 'alpha' ],
    [ ['alpha', 'beta'], 'alpha,beta' ],
    [ ['alpha', 'gamma', 'beta'], '' ],
  ])('works for %j', (names, expected) => {
    expect(
      networkSelectorOptions2pdpFormat(map(networkOption)(names), allNetworks)
    ).toBe(expected);
  });
});


describe('variable2PdpVariableIdentifier', () => {
  it.each([
    [ { standard_name: 'standard_name', },
      'standard_name' ],
    [ { standard_name: 'standard_name', cell_method: null, },
      'standard_name' ],
    [ { standard_name: 'standard_name', cell_method: '' },
      'standard_name' ],
    [ { standard_name: 'standard_name', cell_method: 'cell_method' },
      'standard_namecell_method' ],
    [ { standard_name: 'standard_name', cell_method: 'time: gronk' },
      'standard_name_gronk' ],
    [ { standard_name: 'standard_name', cell_method: 'time: gronk time: argle' },
      'standard_name_gronk _argle' ],
  ])('works for %j', (variable, expected) => {
    expect(variable2PdpVariableIdentifier(variable)).toBe(expected);
  });
});


const variableOptionContext = name => ({
  standard_name: `${name}_sn`,
  cell_method: `${name}_cm`,
});
const variableOption = names => ({
  contexts: map(variableOptionContext)(names)
});

describe('variableSelectorOptions2pdpFormat', () => {
  const allOptions = {
    options: [
      map(variableOption)([['alpha'], ['beta'], ['gamma'], ['delta']]),
    ],
  };

  it.each([
    [ 'empty array', [], '' ],
    [ 'one option, one context',
      [variableOption(['alpha'])],
      'alpha_snalpha_cm' ],
    [ 'one option, two contexts',
      [variableOption(['alpha', 'beta'])],
      'alpha_snalpha_cm,beta_snbeta_cm' ],
    [ 'one option, three contexts',
      [variableOption(['alpha', 'beta', 'gamma'])],
      'alpha_snalpha_cm,beta_snbeta_cm,gamma_sngamma_cm' ],
    [ 'two options',
      [variableOption(['alpha', 'beta']), variableOption(['gamma'])],
      'alpha_snalpha_cm,beta_snbeta_cm,gamma_sngamma_cm' ],
    [ 'repeats',
      [variableOption(['alpha', 'beta']), variableOption(['gamma']),
        variableOption(['alpha']), variableOption(['beta'])],
      'alpha_snalpha_cm,beta_snbeta_cm,gamma_sngamma_cm' ],
    [ 'all options', allOptions.options, '' ],
  ])('works for %s', (description, options, expected) => {
    expect(
      variableSelectorOptions2pdpFormat(options, allOptions)
    ).toBe(expected);
  });
});


const frequencyOption = value => ({ value });

describe('frequencyOptions2pdpFormat', () => {
  const allOptions = map(frequencyOption)(['alpha', 'beta', 'gamma']);

  it.each([
    [ [], '' ],
    [ ['alpha'], 'alpha' ],
    [ ['alpha', 'beta'], 'alpha,beta' ],
    [ ['alpha', 'gamma', 'beta'], '' ],
  ])('works for %j', (values, expected) => {
    expect(
      frequencyOptions2pdpFormat(map(frequencyOption)(values), allOptions)
    ).toBe(expected);
  });
});


const dataFormatOption = value => ({ value });


describe('dataDownloadTarget', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  const regex = s => new RegExp(escapeRegExp(s));

  const geoJSONNullPolygon = {
    "type": "Polygon",
    "coordinates": [ ]
  };

  it('works for clipToDate and onlyWithClimatology true', () => {
    const target = dataDownloadTarget({
      startDate: new Date(2000, 0, 1),
      endDate: new Date(2010, 11, 31),
      selectedNetworksOptions: map(networkOption)(['nw1', 'nw2']),
      selectedVariablesOptions: map(variableOption)([['var1'], ['var2']]),
      selectedFrequenciesOptions: map(frequencyOption)(['freq1', 'freq2']),
      polygon: geoJSONNullPolygon,
      clipToDate: true,
      onlyWithClimatology: true,
      dataCategory: 'category',
      dataFormat: dataFormatOption('format'),
    });
    expect(target).toMatch(regex(`${process.env.REACT_APP_PDP_DATA_URL}/pcds/agg/?`));
    expect(target).toMatch(regex('from-date=2000%2F01%2F01'));
    expect(target).toMatch(regex('to-date=2010%2F12%2F31'));
    expect(target).toMatch(regex('network-name=nw1%2Cnw2'));
    expect(target).toMatch(regex('input-vars=var1_snvar1_cm%2Cvar2_snvar2_cm'));
    expect(target).toMatch(regex('input-freq=freq1%2Cfreq2'));
    expect(target).toMatch(regex('input-polygon=POLYGON'));
    expect(target).toMatch(regex('cliptodate=cliptodate'));
    expect(target).toMatch(regex('only-with-climatology=only-with-climatology'));
    expect(target).toMatch(regex('download-category=Category'));
    expect(target).toMatch(regex('data-format=format'));
  });

  it('works for clipToDate and onlyWithClimatology false', () => {
    const target = dataDownloadTarget({
      startDate: new Date(2000, 0, 1),
      endDate: new Date(2010, 11, 31),
      selectedNetworksOptions: map(networkOption)(['nw1', 'nw2']),
      selectedVariablesOptions: map(variableOption)([['var1'], ['var2']]),
      selectedFrequenciesOptions: map(frequencyOption)(['freq1', 'freq2']),
      polygon: geoJSONNullPolygon,
      clipToDate: false,
      onlyWithClimatology: false,
      dataCategory: 'category',
      dataFormat: dataFormatOption('format'),
    });
    expect(target).toMatch(regex(`${process.env.REACT_APP_PDP_DATA_URL}/pcds/agg/?`));
    expect(target).toMatch(regex('from-date=2000%2F01%2F01'));
    expect(target).toMatch(regex('to-date=2010%2F12%2F31'));
    expect(target).toMatch(regex('network-name=nw1%2Cnw2'));
    expect(target).toMatch(regex('input-vars=var1_snvar1_cm%2Cvar2_snvar2_cm'));
    expect(target).toMatch(regex('input-freq=freq1%2Cfreq2'));
    expect(target).toMatch(regex('input-polygon=POLYGON'));
    expect(target).not.toMatch(regex('cliptodate'));
    expect(target).toMatch(regex('only-with-climatology='));
    expect(target).toMatch(regex('download-category=Category'));
    expect(target).toMatch(regex('data-format=format'));
  });
});

