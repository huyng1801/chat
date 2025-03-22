export const convertFileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      resolve(reader.result);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const isBase64Image = (str) => {
  try {
    return str.startsWith('data:image/');
  } catch (e) {
    return false;
  }
};