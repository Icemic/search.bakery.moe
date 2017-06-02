module.exports = {
  model(vector) {
    let ret = 0;
    for (const v of vector) {
      ret += Math.pow(v, 2);
    }
    return Math.sqrt(ret);
  },
  innerProduct(A, B) {
    if (A.length !== B.length) {
      throw `A and B must have same length.`;
    } else {
      let ret = 0;
      for (let i = 0; i < A.length; i++) {
        ret += A[i] * B[i];
      }
      return ret;
    }
  }
}