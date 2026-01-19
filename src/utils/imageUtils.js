
/**
 * Converts a File or Blob object to a Base64 string.
 * @param {File | Blob} file 
 * @returns {Promise<string>}
 */
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};

/**
 * Converts a Base64 string to a File object.
 * @param {string} base64 - The Base64 string (data:image/png;base64,...)
 * @param {string} filename - The name to give the file
 * @returns {File}
 */
export const base64ToFile = (base64, filename) => {
    const arr = base64.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], filename, { type: mime });
};
