const Admin = require('../models/admin.model');
const File = require('../models/file.model');
const User = require('../models/user.model');
const { uploadFile } = require('../services/storage.service');
const { logUserActivity } = require('../services/activity.service');
const { createNotification } = require('../services/notification.service');

const RESOURCE_POPULATE = [
  { path: 'creator', select: 'fullName username email role' },
  { path: 'reviews.user', select: 'fullName username email role avatar' },
  { path: 'comments.user', select: 'fullName username email role avatar' },
  { path: 'comments.replies.user', select: 'fullName username email role avatar' },
  { path: 'versionHistory.updatedBy', select: 'fullName username' },
  { path: 'moderationHistory.actor', select: 'fullName username email role' },
];

const formatReview = (review) => ({
  id: review._id,
  rating: review.rating,
  comment: review.comment,
  date: review.createdAt,
  userName: review.user?.fullName || review.user?.username || 'Anonymous',
  userAvatar:
    review.user?.avatar ||
    (review.user?.fullName || review.user?.username || 'AN').slice(0, 2).toUpperCase(),
  user: review.user?._id
    ? {
        id: review.user._id,
        fullName: review.user.fullName,
        username: review.user.username,
        email: review.user.email,
        role: review.user.role,
      }
    : null,
});

const formatComment = (comment) => ({
  id: comment._id,
  message: comment.message,
  createdAt: comment.createdAt,
  user: comment.user?._id
    ? {
        id: comment.user._id,
        fullName: comment.user.fullName,
        username: comment.user.username,
        email: comment.user.email,
        role: comment.user.role,
        avatar:
          comment.user.avatar ||
          (comment.user.fullName || comment.user.username || 'AN').slice(0, 2).toUpperCase(),
      }
    : null,
  replies: (comment.replies || []).map((reply) => ({
    id: reply._id,
    message: reply.message,
    createdAt: reply.createdAt,
    user: reply.user?._id
      ? {
          id: reply.user._id,
          fullName: reply.user.fullName,
          username: reply.user.username,
          email: reply.user.email,
          role: reply.user.role,
          avatar:
            reply.user.avatar ||
            (reply.user.fullName || reply.user.username || 'AN').slice(0, 2).toUpperCase(),
        }
      : null,
  })),
});

const parseDocuments = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (!trimmed) {
      return [];
    }

    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
      } catch (_err) {
        return [];
      }
    }

    return trimmed.split(',').map((item) => item.trim()).filter(Boolean);
  }

  return [];
};

const parseStringList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const buildOcrText = ({ title = '', description = '', tags = [], category = '' }) =>
  [title, description, category, ...(tags || [])].join(' ').trim();

const buildExtractedSummary = ({ title = '', description = '', category = '' }) =>
  `${title}${category ? ` | ${category}` : ''}${description ? ` | ${description.slice(0, 160)}` : ''}`.trim();

const scoreSimilarity = (left = '', right = '') => {
  const leftWords = new Set(String(left).toLowerCase().split(/\W+/).filter(Boolean));
  const rightWords = new Set(String(right).toLowerCase().split(/\W+/).filter(Boolean));
  if (!leftWords.size || !rightWords.size) return 0;
  let overlap = 0;
  leftWords.forEach((word) => {
    if (rightWords.has(word)) overlap += 1;
  });
  return Math.round((overlap / Math.max(leftWords.size, rightWords.size)) * 100);
};

const buildResourceInsights = async ({
  resourceId = null,
  title = '',
  description = '',
  tags = [],
  category = '',
}) => {
  const ocrText = buildOcrText({ title, description, tags, category });
  const extractedSummary = buildExtractedSummary({ title, description, category });
  const others = await File.find(resourceId ? { _id: { $ne: resourceId } } : {}).select('title description tags');
  const plagiarismMatches = others
    .map((item) => {
      const score = scoreSimilarity(ocrText, buildOcrText(item));
      return {
        resourceId: item._id,
        title: item.title,
        score,
      };
    })
    .filter((item) => item.score >= 35)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return {
    ocrText,
    extractedSummary,
    plagiarismScore: plagiarismMatches[0]?.score || 0,
    plagiarismMatches,
  };
};

const buildUploadMeta = ({ upload = null, file = null, externalUrl = '' }) => {
  if (upload) {
    return {
      provider: upload.provider || 'external',
      fileId: upload.fileId || '',
      folder: upload.folder || '',
      url: upload.url || '',
      path: upload.path || '',
      originalFileName: file?.originalname || upload.originalFileName || '',
      storedFileName: upload.storedFileName || upload.name || '',
      extension: upload.extension || '',
      mimeType: file?.mimetype || upload.mimeType || '',
      sizeBytes: Number(file?.size || upload.sizeBytes || upload.size || 0),
      uploadedAt: new Date(),
    };
  }

  if (externalUrl) {
    return {
      provider: 'external',
      fileId: '',
      folder: '',
      url: externalUrl,
      path: '',
      originalFileName: '',
      storedFileName: '',
      extension: '',
      mimeType: '',
      sizeBytes: 0,
      uploadedAt: new Date(),
    };
  }

  return null;
};

const createAdmin = async (req, res) => {
  try {
    const { title, labels = [] } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'Admin file is required.' });
    }

    const uploaded = await uploadFile(req.file.buffer, {
      fileName: req.file.originalname || `admin_${Date.now()}`,
      originalFileName: req.file.originalname || '',
      mimeType: req.file.mimetype || '',
      folder: '/Project/studyspher/admin',
    });

    const admin = await Admin.create({
      uri: uploaded.url,
      title,
      admin: req.user.id,
      folder: uploaded.folder || '/Project/studyspher/admin',
      fileName: uploaded.storedFileName || req.file.originalname || '',
      originalFileName: req.file.originalname || '',
      mimeType: req.file.mimetype || '',
      fileSize: Number(req.file.size || uploaded.sizeBytes || 0),
      uploadMeta: buildUploadMeta({ upload: uploaded, file: req.file }),
      labels: parseStringList(labels),
    });

    return res.status(201).json({ admin });
  } catch (err) {
    console.error('[createAdmin]', err);
    return res.status(500).json({ message: 'Unable to upload admin file.' });
  }
};

const createFile = async (req, res) => {
  try {
    const {
      title,
      description = '',
      type = 'pdf',
      category = 'General',
      externalUrl = '',
      fileName = '',
      fileSize = '',
      tags = [],
      prerequisites = [],
      verificationNotes = '',
    } = req.body;
    const documents = parseDocuments(req.body.documents);
    const uploadedFileBuffer = req.file?.buffer || null;
    const normalizedTags = Array.isArray(tags)
      ? tags.filter(Boolean)
      : String(tags)
          .split(',')
          .map((item) => item.trim())
          .filter(Boolean);
    const normalizedPrerequisites = parseStringList(prerequisites);

    if (!title) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    let uploadedDocumentUrl = externalUrl;
    let resolvedFileName = fileName || req.file?.originalname || '';
    let resolvedFileSize = fileSize || (req.file?.size ? String(req.file.size) : '');
    let uploadMeta = buildUploadMeta({ externalUrl });

    if (uploadedFileBuffer) {
      const uploaded = await uploadFile(uploadedFileBuffer, {
        fileName: req.file.originalname || `resource_${Date.now()}`,
        originalFileName: req.file.originalname || '',
        mimeType: req.file.mimetype || '',
        folder: '/Project/studyspher/resources',
      });
      uploadedDocumentUrl = uploaded.url;
      resolvedFileName = resolvedFileName || req.file.originalname || '';
      resolvedFileSize = resolvedFileSize || (req.file?.size ? String(req.file.size) : '');
      uploadMeta = buildUploadMeta({ upload: uploaded, file: req.file });
    }

    const insights = await buildResourceInsights({
      title,
      description,
      tags: normalizedTags,
      category,
    });

    const file = await File.create({
      title,
      description,
      type,
      category,
      externalUrl: uploadedDocumentUrl,
      fileName: resolvedFileName,
      fileSize: resolvedFileSize,
      uploadMeta,
      tags: normalizedTags,
      prerequisites: normalizedPrerequisites,
      verificationNotes,
      ...insights,
      documents,
      creator: req.user.id,
      moderationHistory: [
        {
          action: 'submitted',
          status: 'pending',
          note: verificationNotes || 'Resource submitted for initial review.',
          actor: req.user.id,
        },
      ],
    });

    await logUserActivity(req.user.id, 'resource_upload', {
      label: 'Uploaded a resource',
      metadata: {
        resourceId: file._id,
        resourceTitle: file.title,
      },
    });
    await createNotification({
      recipient: req.user.id,
      type: 'resource_upload',
      title: 'Resource uploaded',
      message: `${file.title} was submitted successfully and is now waiting for review.`,
      link: '/resources/my-uploads',
      metadata: {
        resourceId: file._id,
      },
    });

    return res.status(201).json({ file });
  } catch (err) {
    console.error('[createFile]', err);
    return res.status(500).json({ message: 'Unable to create file record.' });
  }
};

const formatResource = (resource) => {
  const creator = resource.creator || {};
  const reviews = resource.reviews || [];
  const rating =
    reviews.length > 0
      ? Number(
          (
            reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length
          ).toFixed(1)
        )
      : 0;

  return {
    id: resource._id,
    title: resource.title,
    description: resource.description,
    type: resource.type,
    category: resource.category,
    tags: resource.tags,
    status: resource.status,
    externalUrl: resource.externalUrl,
    fileName: resource.fileName,
    fileSize: resource.fileSize,
    uploadMeta: resource.uploadMeta || null,
    rejectionReason: resource.rejectionReason,
    views: resource.views,
    downloads: resource.downloads,
    rating,
    reviewCount: reviews.length,
    reviews: reviews.map(formatReview),
    comments: (resource.comments || []).map(formatComment),
    prerequisites: resource.prerequisites || [],
    ocrText: resource.ocrText || '',
    extractedSummary: resource.extractedSummary || '',
    plagiarismScore: Number(resource.plagiarismScore || 0),
    plagiarismMatches: resource.plagiarismMatches || [],
    verificationNotes: resource.verificationNotes || '',
    versionHistory: (resource.versionHistory || []).map((entry) => ({
      title: entry.title || '',
      description: entry.description || '',
      tags: entry.tags || [],
      externalUrl: entry.externalUrl || '',
      fileName: entry.fileName || '',
      fileSize: entry.fileSize || '',
      uploadMeta: entry.uploadMeta || null,
      updatedAt: entry.updatedAt,
      updatedBy: entry.updatedBy
        ? {
            id: entry.updatedBy._id || entry.updatedBy,
            fullName: entry.updatedBy.fullName || '',
            username: entry.updatedBy.username || '',
          }
        : null,
    })),
    moderationHistory: (resource.moderationHistory || []).map((entry) => ({
      action: entry.action,
      status: entry.status,
      note: entry.note || '',
      createdAt: entry.createdAt,
      actor: entry.actor
        ? {
            id: entry.actor._id || entry.actor,
            fullName: entry.actor.fullName || '',
            username: entry.actor.username || '',
            email: entry.actor.email || '',
            role: entry.actor.role || '',
          }
        : null,
    })),
    createdAt: resource.createdAt,
    updatedAt: resource.updatedAt,
    uploadedAt: resource.createdAt,
    creator: creator._id
      ? {
          id: creator._id,
          fullName: creator.fullName,
          username: creator.username,
          email: creator.email,
          role: creator.role,
        }
      : null,
  };
};

const canViewResource = (resource, user = null) => {
  if (!resource) {
    return false;
  }

  if (resource.status === 'approved') {
    return true;
  }

  const creatorId = resource.creator?._id || resource.creator;
  const userId = user?.id || user?._id;
  const isOwner = userId && creatorId && String(creatorId) === String(userId);
  const isModerator = ['admin', 'moderator'].includes(user?.role);

  return Boolean(isOwner || isModerator);
};

const getResources = async (_req, res) => {
  try {
    const resources = await File.find({ status: 'approved' })
      .populate(RESOURCE_POPULATE)
      .sort({ createdAt: -1 });

    return res.status(200).json({ resources: resources.map(formatResource) });
  } catch (err) {
    console.error('[getResources]', err);
    return res.status(500).json({ message: 'Unable to fetch resources.' });
  }
};

const getResourceById = async (req, res) => {
  try {
    const resource = await File.findById(req.params.id).populate(RESOURCE_POPULATE);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (!canViewResource(resource, req.user)) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (resource.status === 'approved') {
      resource.views += 1;
      await resource.save();
    }

    return res.status(200).json({ resource: formatResource(resource) });
  } catch (err) {
    console.error('[getResourceById]', err);
    return res.status(500).json({ message: 'Unable to fetch resource.' });
  }
};

const getAdminDashboard = async (_req, res) => {
  try {
    const [totalUsers, totalResources, pendingResources, approvedResources, activeUsers, allResources] = await Promise.all([
      User.countDocuments(),
      File.countDocuments(),
      File.countDocuments({ status: 'pending' }),
      File.countDocuments({ status: 'approved' }),
      User.countDocuments({ isActive: true }),
      File.find().select('downloads reviews createdAt'),
    ]);

    const totalDownloads = allResources.reduce(
      (sum, resource) => sum + Number(resource.downloads || 0),
      0
    );
    const reviewValues = allResources.flatMap((resource) =>
      (resource.reviews || []).map((review) => Number(review.rating || 0))
    );
    const averageRating = reviewValues.length
      ? Number(
          (
            reviewValues.reduce((sum, rating) => sum + rating, 0) / reviewValues.length
          ).toFixed(1)
        )
      : 0;
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const monthlyGrowth = allResources.filter((resource) => resource.createdAt >= startOfMonth).length;

    return res.status(200).json({
      stats: {
        totalUsers,
        totalResources,
        pendingResources,
        approvedResources,
        totalDownloads,
        activeUsers,
        averageRating,
        monthlyGrowth,
      },
    });
  } catch (err) {
    console.error('[getAdminDashboard]', err);
    return res.status(500).json({ message: 'Unable to fetch admin dashboard.' });
  }
};

const getAdminUsers = async (_req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });

    return res.status(200).json({
      users: users.map((user) => ({
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      })),
    });
  } catch (err) {
    console.error('[getAdminUsers]', err);
    return res.status(500).json({ message: 'Unable to fetch users.' });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!['user', 'moderator', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await createNotification({
      recipient: user._id,
      type: 'role_update',
      title: 'Role updated',
      message: `Your account role is now ${user.role}.`,
      link: '/profile',
      metadata: { role: user.role },
    });

    return res.status(200).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error('[updateUserRole]', err);
    return res.status(500).json({ message: 'Unable to update user role.' });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: Boolean(isActive) },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    await createNotification({
      recipient: user._id,
      type: 'account_status',
      title: user.isActive ? 'Account restored' : 'Account access changed',
      message: user.isActive
        ? 'Your account has been re-activated.'
        : 'Your account has been deactivated by the admin team.',
      link: '/profile',
      metadata: { isActive: user.isActive },
    });

    return res.status(200).json({
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (err) {
    console.error('[updateUserStatus]', err);
    return res.status(500).json({ message: 'Unable to update user status.' });
  }
};

const getAdminResources = async (_req, res) => {
  try {
    const resources = await File.find()
      .populate(RESOURCE_POPULATE)
      .sort({ createdAt: -1 });

    return res.status(200).json({ resources: resources.map(formatResource) });
  } catch (err) {
    console.error('[getAdminResources]', err);
    return res.status(500).json({ message: 'Unable to fetch admin resources.' });
  }
};

const getAdminResourceById = async (req, res) => {
  try {
    const resource = await File.findById(req.params.id).populate(RESOURCE_POPULATE);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    return res.status(200).json({ resource: formatResource(resource) });
  } catch (err) {
    console.error('[getAdminResourceById]', err);
    return res.status(500).json({ message: 'Unable to fetch admin resource detail.' });
  }
};

const updateResourceStatus = async (req, res) => {
  try {
    const { status, rejectionReason = '' } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid resource status.' });
    }

    const resource = await File.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    resource.status = status;
    resource.rejectionReason = status === 'rejected' ? rejectionReason : '';
    resource.moderationHistory.unshift({
      action:
        status === 'approved'
          ? 'approved'
          : status === 'rejected'
            ? 'rejected'
            : 'returned_to_review',
      status,
      note:
        status === 'rejected'
          ? rejectionReason || 'Resource rejected during moderation.'
          : status === 'approved'
            ? 'Resource approved and published.'
            : 'Resource moved back to review.',
      actor: req.user.id,
    });
    resource.moderationHistory = resource.moderationHistory.slice(0, 20);
    await resource.save();
    await resource.populate(RESOURCE_POPULATE);

    if (resource.creator?._id) {
      if (status === 'approved') {
        await logUserActivity(resource.creator._id, 'resource_approved', {
          label: 'Resource approved',
          metadata: {
            resourceId: resource._id,
            resourceTitle: resource.title,
          },
        });
      }

      await createNotification({
        recipient: resource.creator._id,
        type: `resource_${status}`,
        title:
          status === 'approved'
            ? 'Resource approved'
            : status === 'rejected'
              ? 'Resource needs changes'
              : 'Resource moved to review',
        message:
          status === 'approved'
            ? `${resource.title} is now approved and visible to learners.`
            : status === 'rejected'
              ? `${resource.title} was rejected${rejectionReason ? `: ${rejectionReason}` : '.'}`
              : `${resource.title} is back in the moderation queue.`,
        link: '/resources/my-uploads',
        metadata: {
          resourceId: resource._id,
          status,
          rejectionReason,
        },
      });
    }

    return res.status(200).json({ resource: formatResource(resource) });
  } catch (err) {
    console.error('[updateResourceStatus]', err);
    return res.status(500).json({ message: 'Unable to update resource status.' });
  }
};

const getMyUploads = async (req, res) => {
  try {
    const resources = await File.find({ creator: req.user.id })
      .populate(RESOURCE_POPULATE)
      .sort({ createdAt: -1 });

    return res.status(200).json({ resources: resources.map(formatResource) });
  } catch (err) {
    console.error('[getMyUploads]', err);
    return res.status(500).json({ message: 'Unable to fetch your uploads.' });
  }
};

const updateResource = async (req, res) => {
  try {
    const resource = await File.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    const canManage =
      String(resource.creator) === String(req.user.id) ||
      ['admin', 'moderator'].includes(req.user.role);

    if (!canManage) {
      return res.status(403).json({ message: 'You do not have permission to update this resource.' });
    }

    const updates = {};
    const allowedFields = ['title', 'description', 'type', 'category', 'externalUrl', 'fileName', 'fileSize', 'verificationNotes'];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    if (req.body.tags !== undefined) {
      updates.tags = Array.isArray(req.body.tags)
        ? req.body.tags.filter(Boolean)
        : String(req.body.tags).split(',').map((item) => item.trim()).filter(Boolean);
    }
    if (req.body.prerequisites !== undefined) {
      updates.prerequisites = parseStringList(req.body.prerequisites);
    }

    // Resource edits return to moderation for verification unless elevated role changes status separately.
    if (!['admin', 'moderator'].includes(req.user.role)) {
      updates.status = 'pending';
    }

    updates.versionHistory = [
      {
        title: resource.title,
        description: resource.description,
        tags: resource.tags || [],
        externalUrl: resource.externalUrl,
        fileName: resource.fileName,
        fileSize: resource.fileSize,
        uploadMeta: resource.uploadMeta || null,
        updatedBy: req.user.id,
        updatedAt: new Date(),
      },
      ...(resource.versionHistory || []),
    ].slice(0, 10);
    updates.moderationHistory = [
      {
        action: 'updated',
        status: ['admin', 'moderator'].includes(req.user.role) ? resource.status : 'pending',
        note: 'Resource content updated.',
        actor: req.user.id,
        createdAt: new Date(),
      },
      ...(resource.moderationHistory || []),
    ].slice(0, 20);

    const insights = await buildResourceInsights({
      resourceId: resource._id,
      title: updates.title !== undefined ? updates.title : resource.title,
      description: updates.description !== undefined ? updates.description : resource.description,
      tags: updates.tags !== undefined ? updates.tags : resource.tags,
      category: updates.category !== undefined ? updates.category : resource.category,
    });
    Object.assign(updates, insights);

    const nextType = updates.type !== undefined ? updates.type : resource.type;
    if (nextType !== 'pdf' && updates.externalUrl !== undefined) {
      updates.uploadMeta = buildUploadMeta({ externalUrl: updates.externalUrl });
    }

    const updated = await File.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate(RESOURCE_POPULATE);

    return res.status(200).json({ resource: formatResource(updated) });
  } catch (err) {
    console.error('[updateResource]', err);
    return res.status(500).json({ message: 'Unable to update resource.' });
  }
};

const addModerationNote = async (req, res) => {
  try {
    const { note = '' } = req.body;
    if (!note.trim()) {
      return res.status(400).json({ message: 'Moderation note is required.' });
    }

    const resource = await File.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    resource.verificationNotes = resource.verificationNotes
      ? `${resource.verificationNotes}\n\n${note.trim()}`
      : note.trim();
    resource.moderationHistory.unshift({
      action: 'note_added',
      status: resource.status,
      note: note.trim(),
      actor: req.user.id,
    });
    resource.moderationHistory = resource.moderationHistory.slice(0, 20);
    await resource.save();
    await resource.populate(RESOURCE_POPULATE);

    return res.status(200).json({ resource: formatResource(resource) });
  } catch (err) {
    console.error('[addModerationNote]', err);
    return res.status(500).json({ message: 'Unable to add moderation note.' });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await File.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    const canManage =
      String(resource.creator) === String(req.user.id) ||
      ['admin', 'moderator'].includes(req.user.role);

    if (!canManage) {
      return res.status(403).json({ message: 'You do not have permission to delete this resource.' });
    }

    await File.findByIdAndDelete(req.params.id);
    await User.updateMany(
      {},
      {
        $pull: {
          bookmarkedResources: resource._id,
          'resourceCollections.$[].resourceIds': resource._id,
        },
      }
    );

    return res.status(200).json({ message: 'Resource deleted successfully.' });
  } catch (err) {
    console.error('[deleteResource]', err);
    return res.status(500).json({ message: 'Unable to delete resource.' });
  }
};

const toggleBookmark = async (req, res) => {
  try {
    const resource = await File.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    const user = await User.findById(req.user.id);
    const existing = user.bookmarkedResources.some(
      (resourceId) => String(resourceId) === String(resource._id)
    );

    if (existing) {
      user.bookmarkedResources = user.bookmarkedResources.filter(
        (resourceId) => String(resourceId) !== String(resource._id)
      );
    } else {
      user.bookmarkedResources.unshift(resource._id);
    }

    await user.save();
    if (!existing) {
      await logUserActivity(req.user.id, 'bookmark_added', {
        label: 'Saved a resource',
        metadata: {
          resourceId: resource._id,
          resourceTitle: resource.title,
        },
      });
      await createNotification({
        recipient: req.user.id,
        type: 'bookmark_added',
        title: 'Resource saved',
        message: `${resource.title} was added to your saved resources.`,
        link: '/resources/saved',
        metadata: {
          resourceId: resource._id,
        },
      });
    }
    const bookmarkedResources = await File.find({ _id: { $in: user.bookmarkedResources } })
      .populate(RESOURCE_POPULATE)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      bookmarked: !existing,
      bookmarks: bookmarkedResources.map(formatResource),
    });
  } catch (err) {
    console.error('[toggleBookmark]', err);
    return res.status(500).json({ message: 'Unable to update bookmark.' });
  }
};

const getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'bookmarkedResources',
      populate: RESOURCE_POPULATE,
    });

    return res.status(200).json({
      resources: (user.bookmarkedResources || []).map(formatResource),
    });
  } catch (err) {
    console.error('[getBookmarks]', err);
    return res.status(500).json({ message: 'Unable to fetch bookmarks.' });
  }
};

const getCollections = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'resourceCollections.resourceIds',
      populate: RESOURCE_POPULATE,
    });

    const collections = (user.resourceCollections || []).map((collection) => ({
      id: collection._id,
      name: collection.name,
      description: collection.description,
      createdAt: collection.createdAt,
      resourceIds: (collection.resourceIds || []).map((resource) => resource._id || resource),
      resources: (collection.resourceIds || []).map(formatResource),
    }));

    return res.status(200).json({ collections });
  } catch (err) {
    console.error('[getCollections]', err);
    return res.status(500).json({ message: 'Unable to fetch collections.' });
  }
};

const createCollection = async (req, res) => {
  try {
    const { name, description = '' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Collection name is required.' });
    }

    const user = await User.findById(req.user.id);
    user.resourceCollections.unshift({
      name: name.trim(),
      description,
      resourceIds: [],
    });
    await user.save();
    await logUserActivity(req.user.id, 'collection_created', {
      label: 'Created a collection',
      metadata: {
        collectionName: name.trim(),
      },
    });
    await createNotification({
      recipient: req.user.id,
      type: 'collection_created',
      title: 'Collection created',
      message: `${name.trim()} is ready for you to organize resources.`,
      link: '/resources/collections',
      metadata: {
        collectionName: name.trim(),
      },
    });

    return getCollections(req, res);
  } catch (err) {
    console.error('[createCollection]', err);
    return res.status(500).json({ message: 'Unable to create collection.' });
  }
};

const updateCollection = async (req, res) => {
  try {
    const { name, description = '' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Collection name is required.' });
    }

    const user = await User.findById(req.user.id);
    const collection = user.resourceCollections.id(req.params.collectionId);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found.' });
    }

    collection.name = name.trim();
    collection.description = description.trim();
    await user.save();

    return getCollections(req, res);
  } catch (err) {
    console.error('[updateCollection]', err);
    return res.status(500).json({ message: 'Unable to update collection.' });
  }
};

const addResourceToCollection = async (req, res) => {
  try {
    const { collectionId, resourceId } = req.params;
    const user = await User.findById(req.user.id);
    const collection = user.resourceCollections.id(collectionId);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found.' });
    }

    const resource = await File.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    const exists = collection.resourceIds.some((id) => String(id) === String(resourceId));
    if (!exists) {
      collection.resourceIds.push(resource._id);
      await user.save();
      await logUserActivity(req.user.id, 'collection_add_resource', {
        label: 'Added resource to collection',
        metadata: {
          collectionId: collection._id,
          collectionName: collection.name,
          resourceId: resource._id,
          resourceTitle: resource.title,
        },
      });
      await createNotification({
        recipient: req.user.id,
        type: 'collection_add_resource',
        title: 'Collection updated',
        message: `${resource.title} was added to ${collection.name}.`,
        link: `/resources/collections/${collection._id}`,
        metadata: {
          collectionId: collection._id,
          resourceId: resource._id,
        },
      });
    }

    return getCollections(req, res);
  } catch (err) {
    console.error('[addResourceToCollection]', err);
    return res.status(500).json({ message: 'Unable to add resource to collection.' });
  }
};

const removeResourceFromCollection = async (req, res) => {
  try {
    const { collectionId, resourceId } = req.params;
    const user = await User.findById(req.user.id);
    const collection = user.resourceCollections.id(collectionId);
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found.' });
    }

    collection.resourceIds = collection.resourceIds.filter((id) => String(id) !== String(resourceId));
    await user.save();

    return getCollections(req, res);
  } catch (err) {
    console.error('[removeResourceFromCollection]', err);
    return res.status(500).json({ message: 'Unable to remove resource from collection.' });
  }
};

const deleteCollection = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.resourceCollections = user.resourceCollections.filter(
      (collection) => String(collection._id) !== String(req.params.collectionId)
    );
    await user.save();

    return res.status(200).json({ message: 'Collection deleted successfully.' });
  } catch (err) {
    console.error('[deleteCollection]', err);
    return res.status(500).json({ message: 'Unable to delete collection.' });
  }
};

const addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    if (!rating || !comment) {
      return res.status(400).json({ message: 'Rating and comment are required.' });
    }

    const resource = await File.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (!canViewResource(resource, req.user)) {
      return res.status(403).json({ message: 'You cannot review this resource right now.' });
    }

    const existingReview = resource.reviews.find(
      (review) => String(review.user) === String(req.user.id)
    );

    const isNewReview = !existingReview;
    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment;
    } else {
      resource.reviews.unshift({
        user: req.user.id,
        rating,
        comment,
      });
    }

    await resource.save();
    if (isNewReview) {
      await logUserActivity(req.user.id, 'review_added', {
        label: 'Posted a review',
        metadata: {
          resourceId: resource._id,
          resourceTitle: resource.title,
          rating,
        },
      });
      await createNotification({
        recipient: req.user.id,
        type: 'review_added',
        title: 'Review submitted',
        message: `Your review for ${resource.title} has been posted.`,
        link: `/resources/${resource._id}`,
        metadata: {
          resourceId: resource._id,
          rating,
        },
      });
      if (String(resource.creator) !== String(req.user.id)) {
        await createNotification({
          recipient: resource.creator,
          type: 'resource_review',
          title: 'New review received',
          message: `${resource.title} received a new review from the community.`,
          link: `/resources/${resource._id}`,
          metadata: {
            resourceId: resource._id,
            rating,
          },
        });
      }
    }
    const populated = await File.findById(resource._id).populate(RESOURCE_POPULATE);
    return res.status(201).json({ resource: formatResource(populated) });
  } catch (err) {
    console.error('[addReview]', err);
    return res.status(500).json({ message: 'Unable to add review.' });
  }
};

const getReviews = async (_req, res) => {
  try {
    const resources = await File.find({ status: 'approved', 'reviews.0': { $exists: true } })
      .populate(RESOURCE_POPULATE)
      .sort({ updatedAt: -1 });

    return res.status(200).json({ resources: resources.map(formatResource) });
  } catch (err) {
    console.error('[getReviews]', err);
    return res.status(500).json({ message: 'Unable to fetch reviews.' });
  }
};

const addComment = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Comment message is required.' });
    }

    const resource = await File.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (!canViewResource(resource, req.user)) {
      return res.status(403).json({ message: 'You cannot comment on this resource right now.' });
    }

    resource.comments.unshift({
      user: req.user.id,
      message: message.trim(),
    });
    await resource.save();
    await logUserActivity(req.user.id, 'comment_added', {
      label: 'Added a comment',
      metadata: {
        resourceId: resource._id,
        resourceTitle: resource.title,
      },
    });
    await createNotification({
      recipient: req.user.id,
      type: 'comment_added',
      title: 'Comment posted',
      message: `Your comment on ${resource.title} was added successfully.`,
      link: `/resources/${resource._id}`,
      metadata: {
        resourceId: resource._id,
      },
    });
    if (String(resource.creator) !== String(req.user.id)) {
      await createNotification({
        recipient: resource.creator,
        type: 'resource_comment',
        title: 'New comment on your resource',
        message: `${resource.title} has a new comment waiting for you.`,
        link: `/resources/${resource._id}`,
        metadata: {
          resourceId: resource._id,
        },
      });
    }

    const populated = await File.findById(resource._id).populate(RESOURCE_POPULATE);
    return res.status(201).json({ comments: (populated.comments || []).map(formatComment) });
  } catch (err) {
    console.error('[addComment]', err);
    return res.status(500).json({ message: 'Unable to add comment.' });
  }
};

const addCommentReply = async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Reply message is required.' });
    }

    const resource = await File.findById(req.params.id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (!canViewResource(resource, req.user)) {
      return res.status(403).json({ message: 'You cannot reply to this resource right now.' });
    }

    const comment = resource.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found.' });
    }

    comment.replies.push({
      user: req.user.id,
      message: message.trim(),
    });

    await resource.save();
    await logUserActivity(req.user.id, 'reply_added', {
      label: 'Replied to a comment',
      metadata: {
        resourceId: resource._id,
        resourceTitle: resource.title,
        commentId: comment._id,
      },
    });
    await createNotification({
      recipient: req.user.id,
      type: 'reply_added',
      title: 'Reply posted',
      message: `Your reply on ${resource.title} was added successfully.`,
      link: `/resources/${resource._id}`,
      metadata: {
        resourceId: resource._id,
        commentId: comment._id,
      },
    });
    if (String(comment.user) !== String(req.user.id)) {
      await createNotification({
        recipient: comment.user,
        type: 'comment_reply',
        title: 'New reply to your comment',
        message: `Someone replied to your comment on ${resource.title}.`,
        link: `/resources/${resource._id}`,
        metadata: {
          resourceId: resource._id,
          commentId: comment._id,
        },
      });
    }
    const populated = await File.findById(resource._id).populate(RESOURCE_POPULATE);
    return res.status(201).json({ comments: (populated.comments || []).map(formatComment) });
  } catch (err) {
    console.error('[addCommentReply]', err);
    return res.status(500).json({ message: 'Unable to add reply.' });
  }
};

const getComments = async (req, res) => {
  try {
    const resource = await File.findById(req.params.id).populate(RESOURCE_POPULATE);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (!canViewResource(resource, req.user)) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    return res.status(200).json({ comments: (resource.comments || []).map(formatComment) });
  } catch (err) {
    console.error('[getComments]', err);
    return res.status(500).json({ message: 'Unable to fetch comments.' });
  }
};

const registerDownload = async (req, res) => {
  try {
    const resource = await File.findById(req.params.id).populate(RESOURCE_POPULATE);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (!canViewResource(resource, req.user)) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    if (resource.status !== 'approved') {
      return res.status(400).json({ message: 'Only approved resources can be downloaded.' });
    }

    resource.downloads += 1;
    await resource.save();

    return res.status(200).json({ resource: formatResource(resource) });
  } catch (err) {
    console.error('[registerDownload]', err);
    return res.status(500).json({ message: 'Unable to update downloads.' });
  }
};

module.exports = {
  createAdmin,
  createFile,
  getResources,
  getResourceById,
  getMyUploads,
  updateResource,
  deleteResource,
  toggleBookmark,
  getBookmarks,
  getCollections,
  createCollection,
  updateCollection,
  addResourceToCollection,
  removeResourceFromCollection,
  deleteCollection,
  addReview,
  getReviews,
  addComment,
  addCommentReply,
  getComments,
  registerDownload,
  getAdminDashboard,
  getAdminUsers,
  updateUserRole,
  updateUserStatus,
  getAdminResources,
  getAdminResourceById,
  updateResourceStatus,
  addModerationNote,
};

