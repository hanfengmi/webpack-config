import main from './css/index.css';
import test from './css/test.less';
import loadServe from './js/loadServes.js'
loadServe();


const arr = [1,2,3,4,5];
const brr = arr.map((e)=> e*2);
console.log(brr)