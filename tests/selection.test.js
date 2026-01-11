const { SelectionProcessor } = require('../src/selection');

describe('SelectionProcessor', () => {
  test('skips empty cells', () => {
    const data = [['Comment 1'], [''], ['  '], [null], ['Comment 2']];
    const callback = jest.fn(val => `Polished ${val}`);
    
    const results = SelectionProcessor.processData(data, callback);
    
    expect(callback).toHaveBeenCalledTimes(2);
    expect(results[0][0]).toBe('Polished Comment 1');
    expect(results[1][0]).toBe('');
    expect(results[4][0]).toBe('Polished Comment 2');
  });

  test('handles 2D ranges', () => {
    const data = [['A1', 'B1'], ['A2', 'B2']];
    const callback = jest.fn(val => val);
    const results = SelectionProcessor.processData(data, callback);
    expect(results).toEqual(data);
  });
});
