import { combineReducers } from './redux';

describe('combineReducers', () => {
  it('should ', () => {
    const stateBefore = {
      reducer1: {
        value1: 'value1',
        value2: 'value2'
      },
      reducer2: {
        value3: 'value3',
        value4: 'value4'
      }
    }
    const reducer1 = (state, action) => ({ ...state })
    const reducer2 = (state, action) => ({ ...state, value3: action.value })
    const reducer = combineReducers({ reducer1, reducer2 })
    const state = reducer(stateBefore, { value: 'newValue3' })
    expect(state.reducer2.value3).toBe('newValue3');
  });
});