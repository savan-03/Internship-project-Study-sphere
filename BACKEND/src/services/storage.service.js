const fs = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { ImageKit } = require('@imagekit/nodejs');

let imageKitClient = null;
const uploadsDirectory = path.join(__dirname, '..', 'uploads');

const hasImageKitConfig = () =>
  Boolean(process.env.IMAGEKIT_PUBLIC_KEY && process.env.IMAGEKIT_PRIVATE_KEY);

const getServerPublicUrl = () =>
  (process.env.SERVER_PUBLIC_URL || `http://localhost:${process.env.PORT || 3000}`).replace(/\/$/, '');

const normalizeFolder = (folder = '/Project/studyspher') => {
  const cleaned = String(folder || '/Project/studyspher')
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .replace(/\/+/g, '/')
    .trim();

  return cleaned || 'Project/studyspher';
};

const getExtension = (fileName = '') => path.extname(String(fileName || '')).trim().toLowerCase();

const getImageKitClient = () => {
  if (!hasImageKitConfig()) {
    throw new Error('ImageKit is not configured. Set IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY to enable uploads.');
  }

  if (!imageKitClient) {
    imageKitClient = new ImageKit({
      publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
    });
  }

  return imageKitClient;
};

const uploadFile = async (file, options = {}) => {
  if (!file) {
    throw new Error('No file was provided for upload.');
  }

  if (!hasImageKitConfig()) {
    const buffer = Buffer.isBuffer(file) ? file : Buffer.from(String(file), 'base64');
    const normalizedFolder = normalizeFolder(options.folder);
    const targetDirectory = path.join(uploadsDirectory, normalizedFolder);
    await fs.mkdir(targetDirectory, { recursive: true });
    const extension = getExtension(options.fileName) || '.bin';
    const safeName = `${Date.now()}-${crypto.randomBytes(4).toString('hex')}${extension}`;
    const fullPath = path.join(targetDirectory, safeName);
    await fs.writeFile(fullPath, buffer);
    const urlPath = [normalizedFolder, safeName].filter(Boolean).join('/').replace(/\\/g, '/');

    return {
      provider: 'local',
      fileId: safeName,
      folder: `/${normalizedFolder}`,
      url: `${getServerPublicUrl()}/uploads/${urlPath}`,
      path: fullPath,
      originalFileName: options.originalFileName || options.fileName || safeName,
      storedFileName: safeName,
      extension,
      mimeType: options.mimeType || '',
      sizeBytes: buffer.length,
    };
  }

  const normalizedFile = Buffer.isBuffer(file) ? file.toString('base64') : String(file);
  const normalizedFolder = `/${normalizeFolder(options.folder)}`;

  const result = await getImageKitClient().files.upload({
    file: normalizedFile,
    fileName: options.fileName || `resource_${Date.now()}`,
    folder: normalizedFolder,
    useUniqueFileName: true,
  });

  return {
    ...result,
    provider: 'imagekit',
    folder: normalizedFolder,
    path: result.filePath || '',
    originalFileName: options.originalFileName || options.fileName || result.name || '',
    storedFileName: result.name || options.fileName || '',
    extension: getExtension(options.fileName || result.name) || '',
    mimeType: options.mimeType || '',
    sizeBytes: Number(result.size || 0),
  };
};

module.exports = { uploadFile, normalizeFolder };
