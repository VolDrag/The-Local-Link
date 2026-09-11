import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir('uploads/');
ensureDir('uploads/portfolio/');
ensureDir('uploads/identity/');
ensureDir('uploads/evidence/');
ensureDir('uploads/services/');

const IMAGE_MIMES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']);
const DOC_MIMES = new Set([...IMAGE_MIMES, 'application/pdf']);
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const DOC_EXTS = new Set([...IMAGE_EXTS, '.pdf']);

const sanitizeName = (original) => {
  const ext = path.extname(original).toLowerCase();
  const rand = crypto.randomBytes(8).toString('hex');
  return `${Date.now()}-${rand}${ext}`;
};

const makeStorage = (folder) =>
  multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, folder),
    filename: (_req, file, cb) => cb(null, sanitizeName(file.originalname)),
  });

const makeFilter = (mimes, exts) => (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimeOk = mimes.has(file.mimetype);
  const extOk = exts.has(ext);
  if (mimeOk && extOk) return cb(null, true);
  cb(new Error('File type not allowed. Use JPEG, PNG, WebP, GIF, or PDF where permitted.'));
};

export const uploadProfile = multer({
  storage: makeStorage('uploads/'),
  fileFilter: makeFilter(IMAGE_MIMES, IMAGE_EXTS),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

export const uploadPortfolio = multer({
  storage: makeStorage('uploads/portfolio/'),
  fileFilter: makeFilter(IMAGE_MIMES, IMAGE_EXTS),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
});

export const uploadIdentity = multer({
  storage: makeStorage('uploads/identity/'),
  fileFilter: makeFilter(DOC_MIMES, DOC_EXTS),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
});

export const uploadEvidence = multer({
  storage: makeStorage('uploads/evidence/'),
  fileFilter: makeFilter(DOC_MIMES, DOC_EXTS),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

export const uploadService = multer({
  storage: makeStorage('uploads/services/'),
  fileFilter: makeFilter(IMAGE_MIMES, IMAGE_EXTS),
  limits: { fileSize: 5 * 1024 * 1024, files: 6 },
});

// Backward-compatible default used by existing profile/portfolio routes
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, _file, cb) => {
        if ((req.originalUrl || '').includes('/portfolio') || (req.path || '').includes('portfolio')) {
            cb(null, 'uploads/portfolio/');
        } else if ((req.originalUrl || '').includes('/identity') || (req.path || '').includes('identity')) {
            cb(null, 'uploads/identity/');
        } else {
            cb(null, 'uploads/');
        }
    },
    filename: (_req, file, cb) => cb(null, sanitizeName(file.originalname)),
  }),
  fileFilter: (req, file, cb) => {
    const allowPdf = req.baseUrl && (req.baseUrl.includes('/identity') || req.path.includes('evidence'));
    const mimes = allowPdf ? DOC_MIMES : IMAGE_MIMES;
    const exts = allowPdf ? DOC_EXTS : IMAGE_EXTS;
    const ext = path.extname(file.originalname).toLowerCase();
    if (mimes.has(file.mimetype) && exts.has(ext)) return cb(null, true);
    cb(new Error('Only allowed image (and PDF for ID/evidence) files may be uploaded.'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
