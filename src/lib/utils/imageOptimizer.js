/**
 * Image optimization utilities
 */

export const imageOptimizer = {
	/**
	 * Compress image file before upload
	 */
	async compressImage(file, maxWidth = 800, quality = 0.8) {
		return new Promise((resolve) => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const img = new Image();

			img.onload = () => {
				// Calculate new dimensions
				let { width, height } = img;
				if (width > maxWidth) {
					height = (height * maxWidth) / width;
					width = maxWidth;
				}

				// Set canvas size
				canvas.width = width;
				canvas.height = height;

				// Draw and compress
				ctx.drawImage(img, 0, 0, width, height);
				canvas.toBlob(resolve, 'image/jpeg', quality);
			};

			img.src = URL.createObjectURL(file);
		});
	},

	/**
	 * Convert file to base64 with compression
	 */
	async fileToBase64Compressed(file, maxWidth = 800, quality = 0.8) {
		const compressedFile = await this.compressImage(file, maxWidth, quality);
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(compressedFile);
			reader.onload = () => resolve(reader.result);
			reader.onerror = error => reject(error);
		});
	},

	/**
	 * Validate image file
	 */
	validateImage(file, maxSizeMB = 2) {
		const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
		const maxSizeBytes = maxSizeMB * 1024 * 1024;

		if (!validTypes.includes(file.type)) {
			throw new Error('Invalid file type. Please upload JPG or PNG files only.');
		}

		if (file.size > maxSizeBytes) {
			throw new Error(`File size exceeds ${maxSizeMB}MB limit.`);
		}

		return true;
	}
};