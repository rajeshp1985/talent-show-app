// Image URL utilities for handling various image sources

class ImageUrlHandler {
    constructor() {
        this.supportedDomains = {
            'imgur.com': this.handleImgurUrl.bind(this),
            'i.imgur.com': this.handleDirectImgurUrl.bind(this),
            'drive.google.com': this.handleGoogleDriveUrl.bind(this),
            'photos.google.com': this.handleGooglePhotosUrl.bind(this),
            'dropbox.com': this.handleDropboxUrl.bind(this),
            'onedrive.live.com': this.handleOneDriveUrl.bind(this),
            'github.com': this.handleGitHubUrl.bind(this),
            'raw.githubusercontent.com': this.handleDirectUrl.bind(this),
            // Additional image hosting services
            'i.ibb.co': this.handleDirectUrl.bind(this),
            'i.postimg.cc': this.handleDirectUrl.bind(this),
            'imgpile.com': this.handleDirectUrl.bind(this),
            'res.cloudinary.com': this.handleDirectUrl.bind(this),
            'cdn.jsdelivr.net': this.handleDirectUrl.bind(this),
            'cdn.statically.io': this.handleDirectUrl.bind(this),
            'storage.googleapis.com': this.handleDirectUrl.bind(this),
            'blob.vercel-storage.com': this.handleDirectUrl.bind(this)
        };
    }

    /**
     * Process any image URL and convert it to a direct image URL if possible
     * @param {string} url - The input URL
     * @returns {string} - Processed image URL
     */
    processImageUrl(url) {
        if (!url || typeof url !== 'string') {
            return this.getDefaultImage();
        }

        // Clean the URL
        url = url.trim();

        // If it's already a data URL, return as-is
        if (url.startsWith('data:image/')) {
            return url;
        }

        // If it's a relative URL, make it absolute
        if (url.startsWith('/') || url.startsWith('./')) {
            return new URL(url, window.location.origin).href;
        }

        // If it doesn't start with http/https, add https
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            url = 'https://' + url;
        }

        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname.toLowerCase();

            // Check if we have a specific handler for this domain
            for (const [supportedDomain, handler] of Object.entries(this.supportedDomains)) {
                if (domain === supportedDomain || domain.endsWith('.' + supportedDomain)) {
                    return handler(url, urlObj);
                }
            }

            // For direct image URLs, return as-is
            if (this.isDirectImageUrl(url)) {
                return url;
            }

            // For unknown domains, try to extract image URL or return as-is
            return url;

        } catch (error) {
            console.warn('Invalid URL provided:', url, error);
            return this.getDefaultImage();
        }
    }

    /**
     * Handle Imgur URLs (gallery, album, direct)
     */
    handleImgurUrl(url, urlObj) {
        const path = urlObj.pathname;
        
        // Handle gallery URLs like: https://imgur.com/gallery/those-arms-w0atsf3
        if (path.includes('/gallery/')) {
            const galleryId = path.split('/gallery/')[1].split('/')[0].split('#')[0];
            return `https://i.imgur.com/${galleryId}.jpg`;
        }
        
        // Handle album URLs like: https://imgur.com/a/abc123
        if (path.includes('/a/')) {
            const albumId = path.split('/a/')[1].split('/')[0].split('#')[0];
            return `https://i.imgur.com/${albumId}.jpg`;
        }
        
        // Handle direct imgur URLs like: https://imgur.com/abc123
        if (path.match(/^\/[a-zA-Z0-9]+$/)) {
            const imageId = path.substring(1);
            return `https://i.imgur.com/${imageId}.jpg`;
        }
        
        return url;
    }

    /**
     * Handle direct Imgur URLs
     */
    handleDirectImgurUrl(url, urlObj) {
        // Already a direct image URL
        return url;
    }

    /**
     * Handle Google Drive URLs
     */
    handleGoogleDriveUrl(url, urlObj) {
        // Convert Google Drive share URLs to direct image URLs
        // Handle multiple formats:
        // https://drive.google.com/file/d/FILE_ID/view?usp=sharing
        // https://drive.google.com/file/d/FILE_ID/view?usp=drive_link
        // https://drive.google.com/file/d/FILE_ID/view
        const fileIdMatch = url.match(/\/file\/d\/([a-zA-Z0-9-_]+)/);
        if (fileIdMatch) {
            const fileId = fileIdMatch[1];
            // Try the thumbnail format first, which often works better for images
            return `https://drive.google.com/thumbnail?id=${fileId}&sz=w1000`;
        }
        
        // Handle direct uc URLs (already processed)
        if (url.includes('/uc?') && url.includes('export=view')) {
            return url;
        }
        
        // Handle thumbnail URLs (already processed)
        if (url.includes('/thumbnail?') && url.includes('id=')) {
            return url;
        }
        
        return url;
    }

    /**
     * Handle Google Photos URLs
     */
    handleGooglePhotosUrl(url, urlObj) {
        // Google Photos URLs are complex, return as-is for now
        return url;
    }

    /**
     * Handle Dropbox URLs
     */
    handleDropboxUrl(url, urlObj) {
        // Convert Dropbox share URLs to direct URLs
        if (url.includes('dropbox.com') && url.includes('?dl=0')) {
            return url.replace('?dl=0', '?raw=1');
        }
        return url;
    }

    /**
     * Handle OneDrive URLs
     */
    handleOneDriveUrl(url, urlObj) {
        // OneDrive URLs are complex, return as-is for now
        return url;
    }

    /**
     * Handle GitHub URLs
     */
    handleGitHubUrl(url, urlObj) {
        // Convert GitHub blob URLs to raw URLs
        if (url.includes('/blob/')) {
            return url.replace('github.com', 'raw.githubusercontent.com').replace('/blob/', '/');
        }
        return url;
    }

    /**
     * Handle direct URLs (already processed)
     */
    handleDirectUrl(url, urlObj) {
        return url;
    }

    /**
     * Check if URL appears to be a direct image URL
     */
    isDirectImageUrl(url) {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
        const urlLower = url.toLowerCase();
        return imageExtensions.some(ext => urlLower.includes(ext));
    }

    /**
     * Get default placeholder image
     */
    getDefaultImage() {
        return "data:image/svg+xml,%3Csvg width='300' height='300' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='defaultBg' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%234caf50;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23388e3c;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='300' height='300' fill='url(%23defaultBg)'/%3E%3Ccircle cx='150' cy='120' r='40' fill='white' opacity='0.8'/%3E%3Cellipse cx='150' cy='220' rx='60' ry='80' fill='white' opacity='0.8'/%3E%3Ctext x='150' y='270' font-family='Arial, sans-serif' font-size='32' fill='white' text-anchor='middle'%3E🎪%3C/text%3E%3C/svg%3E";
    }

    /**
     * Validate and process image URL with error handling
     */
    async validateImageUrl(url) {
        const processedUrl = this.processImageUrl(url);
        
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve({ valid: true, url: processedUrl });
            img.onerror = () => resolve({ valid: false, url: this.getDefaultImage() });
            img.src = processedUrl;
            
            // Timeout after 5 seconds
            setTimeout(() => resolve({ valid: false, url: this.getDefaultImage() }), 5000);
        });
    }
}

// Create global instance
window.imageUrlHandler = new ImageUrlHandler();
