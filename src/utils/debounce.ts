export default function(func: Function, ms: number): Function {
  let timeout: number | undefined
  return function(this: any) {
    clearTimeout(timeout);
    timeout = setTimeout(() => { func.apply(this, arguments) }, ms);
  };
}