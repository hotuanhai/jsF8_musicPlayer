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