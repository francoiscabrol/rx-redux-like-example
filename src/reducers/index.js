import { combineReducers } from '../redux';
import name from './name';
import message from './message';

export default combineReducers(name, message);