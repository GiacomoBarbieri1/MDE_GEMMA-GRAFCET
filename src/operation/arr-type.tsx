export { };
// import { types } from "mobx-state-tree";

// type NextArrN<A extends ArrN<T>, T> = A extends Arr1<T> ? Arr2<T> : (A extends Arr2<T> ? Arr3<T>: Arr4<T>);

// export class Arr1<T> {
//   static size: number = 1;
  
//   arr: Array<T>;
//   constructor(arr: Array<T>) {
//     this.arr = arr;
//   }


//   fromStr(s: string): Arr1<T> | null {
//     const b = JSON.parse(s);
//     if (Array.isArray(b)) {
//       return new Arr1(b);
//     } else {
//       return null;
//     }
//   }

//   push(v: T): NextArrN<Arr1<T>, T>{
//     this.arr.push(v);
//     return NextArrN<Arr1<T>, T>.fromArr(this.arr);
//   }
// }

// class Arr2<T> implements IArrN<T> {
//   size: number = 2; 
//   arr: Array<T>;

//   constructor(arr: Array<T>) {  
//     if (arr.length == 2){
//       this.arr = arr;
//     }else{
//       throw Error();
//     }
//   }

//   fromArr(arr: Array<T>) {
//     return new Arr2(arr);
//   }
// }
// interface Arr3<T> {
//   value1: T;
// }
// interface Arr4<T> {
//   value1: T;
// }

// function ArrCustom<T>() {
//   return types.custom<Array<T>, Arr1<T>>({
//     name: "Arr1",
//     fromSnapshot: s => {
//       return new Arr1(s);
//     },
//     getValidationMessage: s => {
//       return "";
//     },
//     isTargetType: s => {
//       return s instanceof Arr1 || s.length == 1;
//     },
//     toSnapshot: v => {
//       return v.arr;
//     }
//   });
// }

// type ArrN<T> = Arr1<T> | Arr2<T> | Arr3<T> | Arr4<T>;
// interface IArrN<T> {
//   static size:number;
//   arr: Array<T>;
//   fromArr(arr: Array<T>): ArrN<T>;
// }