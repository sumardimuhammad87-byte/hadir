/**
 * Compress an uploaded image file into a client-safe base64 string
 * suited for 3x4 student ID photo storage in localStorage and Firestore.
 */
export function compressImageFile(
  file: File,
  maxWidth = 320,
  maxHeight = 420,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Berkas yang dipilih harus berupa file gambar (JPG, PNG, atau WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Gagal membaca berkas gambar.'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, width);
        canvas.height = Math.max(1, height);
        const ctx = canvas.getContext('2d');

        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          let compressed = '';
          try {
            compressed = canvas.toDataURL('image/webp', quality);
            if (!compressed.startsWith('data:image/webp')) {
              compressed = canvas.toDataURL('image/jpeg', quality);
            }
          } catch {
            compressed = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(compressed);
        } else {
          resolve(result);
        }
      };

      img.onerror = () => {
        resolve(result);
      };

      img.src = result;
    };

    reader.onerror = () => {
      reject(new Error('Terjadi kesalahan saat memproses gambar.'));
    };

    reader.readAsDataURL(file);
  });
}
