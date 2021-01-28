function isPrime(num) {
    if (isNaN(num)) {
        return false;
    }
    if (num < 2) {
        return false;
    }
    var sqrtnum = Math.floor(Math.sqrt(num));
    var prime = num !== 1;
    for (var i = 2; i < sqrtnum + 1; i++) {
        if (num % i === 0) {
            prime = false;
            break;
        }
    }
    return prime;
}

function listPrimes(num) {

    if (isNaN(num)) {
        return [];
    }

    if (num < 2) {
        return []
    }
    const arr = [2];
    for (let i = 3; i < num+1; i += 2) {
        if (isPrime(i)) {
            arr.push(i);
        }
    }
    console.log(arr)
    return (arr); // use arr result on your own
}

module.exports = {
    isPrime,
    listPrimes
}
