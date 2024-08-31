function generateRandomArray(n, first) {
    // Create an array with numbers from 0 to n-1, excluding the 'first' element
    let arr = Array.from({ length: n }, (_, i) => i).filter(num => num !== first);

    // Shuffle the array using the Fisher-Yates algorithm
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    // Add the 'first' element at the beginning of the array
    arr.unshift(first);

    return arr;
}

export default generateRandomArray;

function shuffleArray(array, a) {
    var index = array.indexOf(a);

    if (index === -1) {
        throw new Error(`Value ${a} is not in the array`);
    }

    // Swap the first element with the element containing 'a'
    [array[0], array[index]] = [array[index], array[0]];

    // Shuffle the rest of the array starting from index 1
    for (var i = array.length - 1; i > 1; i--) {
        var j = Math.floor(Math.random() * (i - 1)) + 1;
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}

export {shuffleArray}
