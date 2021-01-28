const functions = require("./functions");

test('0 : not_prime ', () => {
    expect(functions.isPrime(0)).toBe(false);
});

test('negative number', () => {
    expect(functions.isPrime(-1)).toBe(false);
});


test('string ', () => {
    expect(functions.isPrime('test')).toBe(false);
});


test('2 : prime ', () => {
    expect(functions.isPrime(2)).toBe(true);
});


test('3 : prime ', () => {
    expect(functions.isPrime(8191)).toBe(true);
});

test('3 : prime ', () => {
    expect(functions.isPrime(8191)).toBe(true);
});
test('large prime ', () => {
    expect(functions.isPrime(131071)).toBe(true);
});
test('very large prime ', () => {
    expect(functions.isPrime(67280421310721)).toBe(true);
});

test('empty list : 1 ', () => {
    expect(functions.listPrimes(1)).toEqual([]);
});

test('empty list : 1 ', () => {
    expect(functions.listPrimes(1)).toEqual([]);
});

test('empty list : string ', () => {
    expect(functions.listPrimes('test')).toEqual([]);
});

