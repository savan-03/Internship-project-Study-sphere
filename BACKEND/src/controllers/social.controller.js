const CommunityGroup = require('../models/community-group.model');
const DirectConversation = require('../models/direct-conversation.model');
const ForumThread = require('../models/forum-thread.model');
const MentorshipRequest = require('../models/mentorship-request.model');
const User = require('../models/user.model');
const { createNotification } = require('../services/notification.service');
const { logUserActivity } = require('../services/activity.service');

const populateGroup = [{ path: 'owner', select: 'fullName username role' }, { path: 'members', select: 'fullName username role' }, { path: 'posts.author', select: 'fullName username role' }];
const populateThread = [{ path: 'author', select: 'fullName username role' }, { path: 'replies.author', select: 'fullName username role' }];
const populateConversation = [
  { path: 'participants', select: 'fullName username role avatar socialProfile skills targetRole stats' },
  { path: 'messages.author', select: 'fullName username role avatar' },
];
const isGroupMember = (group, userId) =>
  (group.members || []).some((member) => String(member._id || member) === String(userId));

const formatGroup = (group, viewerId = null) => ({
  id: group._id,
  name: group.name,
  description: group.description,
  tags: group.tags || [],
  visibility: group.visibility,
  owner: group.owner ? { id: group.owner._id, fullName: group.owner.fullName, username: group.owner.username, role: group.owner.role } : null,
  members: (group.members || []).map((member) => ({
    id: member._id,
    fullName: member.fullName,
    username: member.username,
    role: member.role,
  })),
  posts: (group.posts || []).map((post) => ({
    id: post._id,
    message: post.message,
    createdAt: post.createdAt,
    author: post.author ? { id: post.author._id, fullName: post.author.fullName, username: post.author.username } : null,
  })),
  memberCount: (group.members || []).length,
  isMember: viewerId
    ? (group.members || []).some((member) => String(member._id || member) === String(viewerId))
    : false,
  createdAt: group.createdAt,
});

const formatThread = (thread, viewerId = null) => ({
  id: thread._id,
  title: thread.title,
  body: thread.body,
  category: thread.category,
  tags: thread.tags || [],
  upvoteCount: (thread.upvotes || []).length,
  hasUpvoted: viewerId
    ? (thread.upvotes || []).some((userId) => String(userId) === String(viewerId))
    : false,
  author: thread.author ? { id: thread.author._id, fullName: thread.author.fullName, username: thread.author.username, role: thread.author.role } : null,
  replies: (thread.replies || []).map((reply) => ({
    id: reply._id,
    message: reply.message,
    createdAt: reply.createdAt,
    author: reply.author ? { id: reply.author._id, fullName: reply.author.fullName, username: reply.author.username } : null,
  })),
  replyCount: (thread.replies || []).length,
  createdAt: thread.createdAt,
});

const formatMentorship = (request, viewerId = null) => ({
  id: request._id,
  title: request.title,
  goals: request.goals,
  topics: request.topics || [],
  status: request.status,
  requester: request.requester ? { id: request.requester._id, fullName: request.requester.fullName, username: request.requester.username } : null,
  mentor: request.mentor ? { id: request.mentor._id, fullName: request.mentor.fullName, username: request.mentor.username } : null,
  isRequester: viewerId ? String(request.requester?._id || request.requester) === String(viewerId) : false,
  isMentor: viewerId ? String(request.mentor?._id || request.mentor) === String(viewerId) : false,
  createdAt: request.createdAt,
});

const formatUserCard = (user) => ({
  id: user._id,
  fullName: user.fullName,
  username: user.username,
  role: user.role,
  bio: user.bio || '',
  skills: user.skills || [],
  targetRole: user.targetRole || '',
  avatar: user.avatar || '',
  stats: {
    points: Number(user.stats?.points || 0),
    streak: Number(user.stats?.streak || 0),
    level: user.stats?.level || 'Beginner',
  },
  counts: {
    following: Number(user.followingUsers?.length || 0),
    followers: Number(user.followerUsers?.length || 0),
  },
  socialProfile: {
    headline: user.socialProfile?.headline || '',
    openToMentoring: Boolean(user.socialProfile?.openToMentoring),
    openToCollaboration: user.socialProfile?.openToCollaboration !== false,
  },
});

const formatFeedItem = (user, entry) => ({
  id: `${user._id}_${entry._id}`,
  action: entry.action,
  label: entry.label,
  metadata: entry.metadata || {},
  pointsAwarded: Number(entry.pointsAwarded || 0),
  createdAt: entry.createdAt,
  actor: {
    id: user._id,
    fullName: user.fullName,
    username: user.username,
    role: user.role,
    avatar: user.avatar || '',
  },
});

const formatDirectConversation = (conversation, viewerId = null) => {
  const participants = conversation.participants || [];
  const partner = participants.find(
    (participant) => String(participant._id || participant.id || participant) !== String(viewerId)
  );
  const messages = (conversation.messages || []).map((item) => ({
    id: item._id,
    message: item.message,
    createdAt: item.createdAt,
    isMine: String(item.author?._id || item.author) === String(viewerId),
    author: item.author
      ? {
          id: item.author._id || item.author,
          fullName: item.author.fullName || '',
          username: item.author.username || '',
          role: item.author.role || 'user',
          avatar: item.author.avatar || '',
        }
      : null,
    readBy: (item.readBy || []).map((userId) => String(userId)),
  }));

  const latestMessage = messages[messages.length - 1] || null;
  const unreadCount = messages.filter(
    (item) =>
      !item.isMine &&
      viewerId &&
      !(item.readBy || []).some((userId) => String(userId) === String(viewerId))
  ).length;

  return {
    id: conversation._id,
    participant: partner
      ? {
          id: partner._id || partner.id,
          fullName: partner.fullName || '',
          username: partner.username || '',
          role: partner.role || 'user',
          avatar: partner.avatar || '',
          skills: partner.skills || [],
          targetRole: partner.targetRole || '',
          socialProfile: {
            headline: partner.socialProfile?.headline || '',
            openToMentoring: Boolean(partner.socialProfile?.openToMentoring),
            openToCollaboration: partner.socialProfile?.openToCollaboration !== false,
          },
          stats: {
            points: Number(partner.stats?.points || 0),
            streak: Number(partner.stats?.streak || 0),
            level: partner.stats?.level || 'Beginner',
          },
        }
      : null,
    participants: participants.map((participant) => ({
      id: participant._id || participant.id,
      fullName: participant.fullName || '',
      username: participant.username || '',
      role: participant.role || 'user',
      avatar: participant.avatar || '',
    })),
    messages,
    unreadCount,
    latestMessage,
    latestMessageAt: latestMessage?.createdAt || conversation.updatedAt,
    updatedAt: conversation.updatedAt,
  };
};

const findDirectConversation = (userId, partnerId) =>
  DirectConversation.findOne({
    participants: { $all: [userId, partnerId], $size: 2 },
  });

const findOrCreateDirectConversation = async (userId, partnerId) => {
  let conversation = await findDirectConversation(userId, partnerId);
  if (!conversation) {
    conversation = await DirectConversation.create({
      participants: [userId, partnerId],
      messages: [],
    });
  }
  return conversation;
};

const getSocialSummary = async (req, res) => {
  try {
    const [groups, threads, mentorship] = await Promise.all([
      CommunityGroup.find().populate(populateGroup).sort({ createdAt: -1 }).limit(6),
      ForumThread.find().populate(populateThread).sort({ createdAt: -1 }).limit(8),
      MentorshipRequest.find().populate('requester mentor', 'fullName username').sort({ createdAt: -1 }).limit(6),
    ]);

    return res.status(200).json({
      groups: groups.map((group) => formatGroup(group, req.user.id)),
      threads: threads.map((thread) => formatThread(thread, req.user.id)),
      mentorship: mentorship.map((item) => formatMentorship(item, req.user.id)),
    });
  } catch (err) {
    console.error('[getSocialSummary]', err);
    return res.status(500).json({ message: 'Unable to fetch social summary.' });
  }
};

const getNetworkOverview = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id)
      .populate('followingUsers', 'fullName username role bio skills targetRole stats avatar socialProfile')
      .populate('followerUsers', 'fullName username role bio skills targetRole stats avatar socialProfile');

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const excludeIds = [
      currentUser._id,
      ...(currentUser.followingUsers || []).map((user) => user._id),
    ];

    const suggestions = await User.find({
      _id: { $nin: excludeIds },
      isActive: true,
    })
      .sort({ 'stats.points': -1, createdAt: -1 })
      .limit(8)
      .select('fullName username role bio skills targetRole stats avatar socialProfile followingUsers followerUsers');

    return res.status(200).json({
      following: (currentUser.followingUsers || []).map(formatUserCard),
      followers: (currentUser.followerUsers || []).map(formatUserCard),
      suggestions: suggestions.map(formatUserCard),
      counts: {
        following: currentUser.followingUsers?.length || 0,
        followers: currentUser.followerUsers?.length || 0,
      },
    });
  } catch (err) {
    console.error('[getNetworkOverview]', err);
    return res.status(500).json({ message: 'Unable to fetch your network.' });
  }
};

const toggleFollowUser = async (req, res) => {
  try {
    if (String(req.params.userId) === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot follow yourself.' });
    }

    const [currentUser, targetUser] = await Promise.all([
      User.findById(req.user.id),
      User.findById(req.params.userId),
    ]);

    if (!currentUser || !targetUser || !targetUser.isActive) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isFollowing = (currentUser.followingUsers || []).some(
      (userId) => String(userId) === String(targetUser._id)
    );

    if (isFollowing) {
      currentUser.followingUsers = currentUser.followingUsers.filter(
        (userId) => String(userId) !== String(targetUser._id)
      );
      targetUser.followerUsers = targetUser.followerUsers.filter(
        (userId) => String(userId) !== String(currentUser._id)
      );
    } else {
      currentUser.followingUsers.unshift(targetUser._id);
      targetUser.followerUsers.unshift(currentUser._id);
      await logUserActivity(req.user.id, 'social_followed_user', {
        label: 'Followed a learner',
        metadata: {
          targetUserId: targetUser._id,
          targetUsername: targetUser.username,
        },
      });
      await createNotification({
        recipient: targetUser._id,
        type: 'social_follow',
        title: 'New follower',
        message: `${req.user.username} started following your StudySphere profile.`,
        link: `/users/${req.user.id}`,
        metadata: {
          followerUserId: req.user.id,
        },
      });
    }

    await Promise.all([currentUser.save(), targetUser.save()]);

    return res.status(200).json({
      following: !isFollowing,
      targetUser: formatUserCard(targetUser),
      counts: {
        following: currentUser.followingUsers.length,
        followers: targetUser.followerUsers.length,
      },
    });
  } catch (err) {
    console.error('[toggleFollowUser]', err);
    return res.status(500).json({ message: 'Unable to update follow status.' });
  }
};

const getActivityFeed = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user.id).select('followingUsers');
    if (!currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const feedUsers = await User.find({
      _id: { $in: [req.user.id, ...(currentUser.followingUsers || [])] },
    }).select('fullName username role avatar activityLog');

    const items = feedUsers
      .flatMap((user) => (user.activityLog || []).map((entry) => formatFeedItem(user, entry)))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 40);

    return res.status(200).json({ items });
  } catch (err) {
    console.error('[getActivityFeed]', err);
    return res.status(500).json({ message: 'Unable to fetch social feed.' });
  }
};

const listDirectConversations = async (req, res) => {
  try {
    const [currentUser, conversations] = await Promise.all([
      User.findById(req.user.id)
        .populate('followingUsers', 'fullName username role avatar socialProfile skills targetRole stats')
        .populate('followerUsers', 'fullName username role avatar socialProfile skills targetRole stats'),
      DirectConversation.find({ participants: req.user.id })
        .populate(populateConversation)
        .sort({ updatedAt: -1 }),
    ]);

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const contactsMap = new Map();
    [...(currentUser.followingUsers || []), ...(currentUser.followerUsers || [])].forEach((person) => {
      contactsMap.set(String(person._id), formatUserCard(person));
    });

    return res.status(200).json({
      conversations: conversations.map((conversation) =>
        formatDirectConversation(conversation, req.user.id)
      ),
      contacts: [...contactsMap.values()],
    });
  } catch (err) {
    console.error('[listDirectConversations]', err);
    return res.status(500).json({ message: 'Unable to fetch direct conversations.' });
  }
};

const getDirectConversationMessages = async (req, res) => {
  try {
    if (String(req.params.userId) === String(req.user.id)) {
      return res.status(400).json({ message: 'Choose another user to open a direct conversation.' });
    }

    const targetUser = await User.findById(req.params.userId).select(
      'fullName username role avatar socialProfile skills targetRole stats isActive'
    );
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({ message: 'User not found.' });
    }

    let conversation = await findDirectConversation(req.user.id, req.params.userId);
    if (!conversation) {
      return res.status(200).json({
        conversation: {
          id: null,
          participant: formatUserCard(targetUser),
          participants: [],
          messages: [],
          unreadCount: 0,
          latestMessage: null,
          latestMessageAt: null,
        },
      });
    }

    conversation = await DirectConversation.findById(conversation._id).populate(populateConversation);
    let didUpdateReadState = false;
    (conversation.messages || []).forEach((item) => {
      const isOwnMessage = String(item.author?._id || item.author) === String(req.user.id);
      const hasRead = (item.readBy || []).some((userId) => String(userId) === String(req.user.id));
      if (!isOwnMessage && !hasRead) {
        item.readBy.push(req.user.id);
        didUpdateReadState = true;
      }
    });
    if (didUpdateReadState) {
      await conversation.save();
      await conversation.populate(populateConversation);
    }

    return res.status(200).json({
      conversation: formatDirectConversation(conversation, req.user.id),
    });
  } catch (err) {
    console.error('[getDirectConversationMessages]', err);
    return res.status(500).json({ message: 'Unable to fetch direct messages.' });
  }
};

const sendDirectMessage = async (req, res) => {
  try {
    const { message = '' } = req.body;
    if (!message.trim()) {
      return res.status(400).json({ message: 'Message is required.' });
    }
    if (String(req.params.userId) === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot message yourself.' });
    }

    const targetUser = await User.findById(req.params.userId).select('fullName username isActive');
    if (!targetUser || !targetUser.isActive) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const conversation = await findOrCreateDirectConversation(req.user.id, targetUser._id);
    conversation.messages.push({
      author: req.user.id,
      message: message.trim(),
      readBy: [req.user.id],
    });
    await conversation.save();

    await logUserActivity(req.user.id, 'social_direct_message', {
      label: 'Sent a direct message',
      metadata: {
        targetUserId: targetUser._id,
        targetUsername: targetUser.username,
      },
      pointsAwarded: 0,
    });
    await createNotification({
      recipient: targetUser._id,
      type: 'social_direct_message',
      title: 'New direct message',
      message: `${req.user.username} sent you a direct message on StudySphere.`,
      link: `/social/direct/${req.user.id}`,
      metadata: {
        fromUserId: req.user.id,
      },
    });

    await conversation.populate(populateConversation);
    return res.status(201).json({
      conversation: formatDirectConversation(conversation, req.user.id),
    });
  } catch (err) {
    console.error('[sendDirectMessage]', err);
    return res.status(500).json({ message: 'Unable to send direct message.' });
  }
};

const listGroups = async (req, res) => {
  try {
    const groups = await CommunityGroup.find().populate(populateGroup).sort({ createdAt: -1 });
    return res.status(200).json({ groups: groups.map((group) => formatGroup(group, req.user.id)) });
  } catch (err) {
    console.error('[listGroups]', err);
    return res.status(500).json({ message: 'Unable to fetch groups.' });
  }
};

const createGroup = async (req, res) => {
  try {
    const { name, description = '', tags = [], visibility = 'public' } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Group name is required.' });
    }
    const group = await CommunityGroup.create({
      name: name.trim(),
      description,
      tags: Array.isArray(tags) ? tags : String(tags).split(',').map((item) => item.trim()).filter(Boolean),
      visibility,
      owner: req.user.id,
      members: [req.user.id],
    });
    await logUserActivity(req.user.id, 'social_group_created', {
      label: 'Created a study group',
      metadata: {
        groupId: group._id,
        groupName: group.name,
      },
    });
    const populated = await CommunityGroup.findById(group._id).populate(populateGroup);
    return res.status(201).json({ group: formatGroup(populated, req.user.id) });
  } catch (err) {
    console.error('[createGroup]', err);
    return res.status(500).json({ message: 'Unable to create group.' });
  }
};

const joinGroup = async (req, res) => {
  try {
    const group = await CommunityGroup.findById(req.params.id).populate(populateGroup);
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }
    if (!isGroupMember(group, req.user.id)) {
      group.members.push(req.user.id);
      await group.save();
      await logUserActivity(req.user.id, 'social_group_joined', {
        label: 'Joined a study group',
        metadata: {
          groupId: group._id,
          groupName: group.name,
        },
      });
      if (String(group.owner?._id || group.owner) !== String(req.user.id)) {
        await createNotification({
          recipient: group.owner?._id || group.owner,
          type: 'social_group_join',
          title: 'New group member',
          message: `${req.user.username} joined ${group.name}.`,
          link: `/groups?group=${group._id}`,
          metadata: { groupId: group._id },
        });
      }
    }
    const populated = await CommunityGroup.findById(group._id).populate(populateGroup);
    return res.status(200).json({ group: formatGroup(populated, req.user.id) });
  } catch (err) {
    console.error('[joinGroup]', err);
    return res.status(500).json({ message: 'Unable to join group.' });
  }
};

const leaveGroup = async (req, res) => {
  try {
    const group = await CommunityGroup.findById(req.params.id).populate(populateGroup);
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }
    if (String(group.owner?._id || group.owner) === String(req.user.id)) {
      return res.status(400).json({ message: 'Group owners cannot leave their own group.' });
    }

    group.members = (group.members || []).filter(
      (member) => String(member._id || member) !== String(req.user.id)
    );
    await group.save();
    const populated = await CommunityGroup.findById(group._id).populate(populateGroup);
    return res.status(200).json({ group: formatGroup(populated, req.user.id) });
  } catch (err) {
    console.error('[leaveGroup]', err);
    return res.status(500).json({ message: 'Unable to leave group.' });
  }
};

const addGroupPost = async (req, res) => {
  try {
    const { message = '' } = req.body;
    if (!message.trim()) {
      return res.status(400).json({ message: 'Post message is required.' });
    }
    const group = await CommunityGroup.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }
    if (!isGroupMember(group, req.user.id)) {
      return res.status(403).json({ message: 'Join the group before posting in the conversation.' });
    }
    group.posts.unshift({ author: req.user.id, message: message.trim() });
    await group.save();
    await logUserActivity(req.user.id, 'social_group_post', {
      label: 'Posted in a study group',
      metadata: {
        groupId: group._id,
        groupName: group.name,
      },
      pointsAwarded: 0,
    });
    const notifyTargets = (group.members || []).filter(
      (memberId) => String(memberId) !== String(req.user.id)
    );
    await Promise.all(
      notifyTargets.map((memberId) =>
        createNotification({
          recipient: memberId,
          type: 'social_group_post',
          title: 'New group message',
          message: `${req.user.username} posted in ${group.name}.`,
          link: `/social/chat?mode=groups&group=${group._id}`,
          metadata: { groupId: group._id },
        })
      )
    );
    const populated = await CommunityGroup.findById(group._id).populate(populateGroup);
    return res.status(201).json({ group: formatGroup(populated, req.user.id) });
  } catch (err) {
    console.error('[addGroupPost]', err);
    return res.status(500).json({ message: 'Unable to post in group.' });
  }
};

const listGroupMessages = async (req, res) => {
  try {
    const group = await CommunityGroup.findById(req.params.id).populate(populateGroup);
    if (!group) {
      return res.status(404).json({ message: 'Group not found.' });
    }
    if (!isGroupMember(group, req.user.id)) {
      return res.status(403).json({ message: 'Join the group to view its messages.' });
    }

    const since = req.query.since ? new Date(req.query.since) : null;
    const limit = Math.min(Math.max(Number(req.query.limit) || 40, 1), 100);
    const formattedGroup = formatGroup(group, req.user.id);
    let messages = formattedGroup.posts || [];

    if (since && !Number.isNaN(since.getTime())) {
      messages = messages.filter((message) => new Date(message.createdAt) > since);
    }

    const sortedMessages = [...messages]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      .slice(-limit);

    return res.status(200).json({
      group: {
        id: formattedGroup.id,
        name: formattedGroup.name,
        description: formattedGroup.description,
        tags: formattedGroup.tags,
        memberCount: formattedGroup.members.length,
      },
      messages: sortedMessages,
      serverTime: new Date().toISOString(),
      latestMessageAt: sortedMessages[sortedMessages.length - 1]?.createdAt || null,
    });
  } catch (err) {
    console.error('[listGroupMessages]', err);
    return res.status(500).json({ message: 'Unable to fetch group messages.' });
  }
};

const listThreads = async (req, res) => {
  try {
    const threads = await ForumThread.find().populate(populateThread).sort({ createdAt: -1 });
    return res.status(200).json({ threads: threads.map((thread) => formatThread(thread, req.user.id)) });
  } catch (err) {
    console.error('[listThreads]', err);
    return res.status(500).json({ message: 'Unable to fetch forum threads.' });
  }
};

const createThread = async (req, res) => {
  try {
    const { title, body, category = 'General', tags = [] } = req.body;
    if (!title || !body) {
      return res.status(400).json({ message: 'Title and body are required.' });
    }
    const thread = await ForumThread.create({
      title,
      body,
      category,
      tags: Array.isArray(tags) ? tags : String(tags).split(',').map((item) => item.trim()).filter(Boolean),
      author: req.user.id,
    });
    await logUserActivity(req.user.id, 'social_thread_created', {
      label: 'Started a forum thread',
      metadata: {
        threadId: thread._id,
        threadTitle: thread.title,
      },
    });
    const populated = await ForumThread.findById(thread._id).populate(populateThread);
    return res.status(201).json({ thread: formatThread(populated, req.user.id) });
  } catch (err) {
    console.error('[createThread]', err);
    return res.status(500).json({ message: 'Unable to create thread.' });
  }
};

const replyThread = async (req, res) => {
  try {
    const { message = '' } = req.body;
    if (!message.trim()) {
      return res.status(400).json({ message: 'Reply message is required.' });
    }
    const thread = await ForumThread.findById(req.params.id);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found.' });
    }
    thread.replies.push({ author: req.user.id, message: message.trim() });
    await thread.save();
    await logUserActivity(req.user.id, 'social_thread_reply', {
      label: 'Replied in the forum',
      metadata: {
        threadId: thread._id,
        threadTitle: thread.title,
      },
      pointsAwarded: 0,
    });
    if (String(thread.author) !== String(req.user.id)) {
      await createNotification({
        recipient: thread.author,
        type: 'social_thread_reply',
        title: 'New forum reply',
        message: `${req.user.username} replied to your thread "${thread.title}".`,
        link: `/forums?thread=${thread._id}`,
        metadata: { threadId: thread._id },
      });
    }
    const populated = await ForumThread.findById(thread._id).populate(populateThread);
    return res.status(201).json({ thread: formatThread(populated, req.user.id) });
  } catch (err) {
    console.error('[replyThread]', err);
    return res.status(500).json({ message: 'Unable to reply to thread.' });
  }
};

const upvoteThread = async (req, res) => {
  try {
    const thread = await ForumThread.findById(req.params.id).populate(populateThread);
    if (!thread) {
      return res.status(404).json({ message: 'Thread not found.' });
    }
    const exists = thread.upvotes.some((userId) => String(userId) === String(req.user.id));
    thread.upvotes = exists
      ? thread.upvotes.filter((userId) => String(userId) !== String(req.user.id))
      : [...thread.upvotes, req.user.id];
    await thread.save();
    if (!exists) {
      await logUserActivity(req.user.id, 'social_thread_upvote', {
        label: 'Upvoted a forum thread',
        metadata: {
          threadId: thread._id,
          threadTitle: thread.title,
        },
        pointsAwarded: 0,
      });
    }
    if (!exists && String(thread.author?._id || thread.author) !== String(req.user.id)) {
      await createNotification({
        recipient: thread.author?._id || thread.author,
        type: 'social_thread_upvote',
        title: 'Your thread got an upvote',
        message: `${req.user.username} upvoted "${thread.title}".`,
        link: `/forums?thread=${thread._id}`,
        metadata: { threadId: thread._id },
      });
    }
    const populated = await ForumThread.findById(thread._id).populate(populateThread);
    return res.status(200).json({ thread: formatThread(populated, req.user.id) });
  } catch (err) {
    console.error('[upvoteThread]', err);
    return res.status(500).json({ message: 'Unable to update thread vote.' });
  }
};

const listMentorship = async (req, res) => {
  try {
    const requests = await MentorshipRequest.find()
      .populate('requester mentor', 'fullName username')
      .sort({ createdAt: -1 });
    return res.status(200).json({ requests: requests.map((item) => formatMentorship(item, req.user.id)) });
  } catch (err) {
    console.error('[listMentorship]', err);
    return res.status(500).json({ message: 'Unable to fetch mentorship requests.' });
  }
};

const createMentorship = async (req, res) => {
  try {
    const { title, goals = '', topics = [] } = req.body;
    if (!title || !title.trim()) {
      return res.status(400).json({ message: 'Mentorship title is required.' });
    }
    const request = await MentorshipRequest.create({
      requester: req.user.id,
      title: title.trim(),
      goals,
      topics: Array.isArray(topics) ? topics : String(topics).split(',').map((item) => item.trim()).filter(Boolean),
    });
    await logUserActivity(req.user.id, 'social_mentorship_requested', {
      label: 'Requested mentorship',
      metadata: {
        mentorshipId: request._id,
        mentorshipTitle: request.title,
      },
    });
    const populated = await MentorshipRequest.findById(request._id).populate('requester mentor', 'fullName username');
    return res.status(201).json({ request: formatMentorship(populated, req.user.id) });
  } catch (err) {
    console.error('[createMentorship]', err);
    return res.status(500).json({ message: 'Unable to create mentorship request.' });
  }
};

const acceptMentorship = async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id).populate('requester mentor', 'fullName username');
    if (!request) {
      return res.status(404).json({ message: 'Mentorship request not found.' });
    }
    if (request.status !== 'open') {
      return res.status(400).json({ message: 'This mentorship request is no longer open.' });
    }
    request.mentor = req.user.id;
    request.status = 'accepted';
    await request.save();
    await logUserActivity(req.user.id, 'social_mentorship_accepted', {
      label: 'Accepted a mentorship request',
      metadata: {
        mentorshipId: request._id,
        mentorshipTitle: request.title,
      },
    });
    await createNotification({
      recipient: request.requester._id || request.requester,
      type: 'social_mentorship',
      title: 'Mentorship request accepted',
      message: `${req.user.username} accepted your mentorship request "${request.title}".`,
      link: `/forums?mentorship=${request._id}`,
      metadata: { mentorshipId: request._id },
    });
    const populated = await MentorshipRequest.findById(request._id).populate('requester mentor', 'fullName username');
    return res.status(200).json({ request: formatMentorship(populated, req.user.id) });
  } catch (err) {
    console.error('[acceptMentorship]', err);
    return res.status(500).json({ message: 'Unable to accept mentorship request.' });
  }
};

const closeMentorship = async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id).populate('requester mentor', 'fullName username');
    if (!request) {
      return res.status(404).json({ message: 'Mentorship request not found.' });
    }

    const canClose =
      String(request.requester?._id || request.requester) === String(req.user.id) ||
      String(request.mentor?._id || request.mentor) === String(req.user.id);

    if (!canClose) {
      return res.status(403).json({ message: 'You do not have permission to close this mentorship request.' });
    }

    request.status = 'closed';
    await request.save();
    const populated = await MentorshipRequest.findById(request._id).populate('requester mentor', 'fullName username');
    return res.status(200).json({ request: formatMentorship(populated, req.user.id) });
  } catch (err) {
    console.error('[closeMentorship]', err);
    return res.status(500).json({ message: 'Unable to close mentorship request.' });
  }
};

module.exports = {
  getSocialSummary,
  getNetworkOverview,
  toggleFollowUser,
  getActivityFeed,
  listDirectConversations,
  getDirectConversationMessages,
  sendDirectMessage,
  listGroups,
  createGroup,
  joinGroup,
  leaveGroup,
  addGroupPost,
  listGroupMessages,
  listThreads,
  createThread,
  replyThread,
  upvoteThread,
  listMentorship,
  createMentorship,
  acceptMentorship,
  closeMentorship,
};
