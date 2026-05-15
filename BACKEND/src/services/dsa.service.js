const DsaProblem = require('../models/dsa-problem.model');

const makeStarterCode = (jsName, pyName = jsName, javaBody = 'return null;', cppBody = 'return {};') => ({
  javascript: `function ${jsName}(...args) {\n  // your code here\n}\n`,
  python: `def ${pyName}(*args):\n    # your code here\n    pass\n`,
  java: `class Solution {\n    public Object ${jsName}(Object... args) {\n        ${javaBody}\n    }\n}\n`,
  cpp: `class Solution {\npublic:\n    auto ${jsName}(auto... args) {\n        ${cppBody}\n    }\n};\n`,
});

const withSharedMetadata = (problem) => ({
  estimatedMinutes: 20,
  patterns: [],
  companyTags: [],
  complexity: { time: '', space: '' },
  editorialSections: [],
  videoResource: {
    title: `${problem.title} walkthrough`,
    provider: 'StudySphere',
    url: '',
    status: 'placeholder',
    summary: 'Video walkthrough placeholder. Add your preferred explanation link or upload a session later.',
  },
  ...problem,
});

const starterProblems = [
  withSharedMetadata({
    title: 'Two Sum',
    slug: 'two-sum',
    difficulty: 'easy',
    category: 'Arrays',
    topic: 'Arrays',
    tags: ['array', 'hash-map'],
    companyTags: ['Amazon', 'Google', 'Meta'],
    patterns: ['Complement lookup', 'Hash map'],
    statement:
      'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9', 'Exactly one valid answer exists.'],
    hints: ['Use a hash map to store visited values.', 'Check whether target - current exists before storing current value.'],
    examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' }],
    starterCode: {
      javascript: 'function twoSum(nums, target) {\n  // your code here\n}\n',
      python: 'def two_sum(nums, target):\n    # your code here\n    pass\n',
      java: 'class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        return new int[]{};\n    }\n}\n',
      cpp: 'class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        return {};\n    }\n};\n',
    },
    functionName: 'twoSum',
    testCases: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [0, 1] },
      { input: [[3, 2, 4], 6], expectedOutput: [1, 2] },
    ],
    hiddenTests: [{ input: [[3, 3], 6], expectedOutput: [0, 1] }],
    editorial: 'Traverse once while storing value -> index in a map. For each number, look for target - number.',
    editorialSections: [
      { title: 'Approach', content: 'Use a hash map keyed by number so each element can check whether its complement has already appeared.' },
      { title: 'Why It Works', content: 'Each pair is checked exactly once while preserving constant-time complement lookups.' },
      { title: 'Complexity', content: 'Time O(n), space O(n).' },
    ],
    complexity: { time: 'O(n)', space: 'O(n)' },
    estimatedMinutes: 15,
    acceptanceRate: 53.4,
    order: 1,
  }),
  withSharedMetadata({
    title: 'Valid Parentheses',
    slug: 'valid-parentheses',
    difficulty: 'easy',
    category: 'Stacks',
    topic: 'Stacks',
    tags: ['stack', 'string'],
    companyTags: ['Microsoft', 'Adobe', 'Amazon'],
    patterns: ['Stack simulation'],
    statement:
      'Given a string s containing just the characters (), {}, and [], determine if the input string is valid.',
    constraints: ['1 <= s.length <= 10^4', 's consists of parentheses only.'],
    hints: ['Use a stack for opening brackets.', 'Each closing bracket must match the latest opening bracket.'],
    examples: [{ input: 's = "()[]{}"', output: 'true', explanation: 'Every opening bracket has a matching closing bracket.' }],
    starterCode: {
      javascript: 'function isValid(s) {\n  // your code here\n}\n',
      python: 'def is_valid(s):\n    # your code here\n    pass\n',
      java: 'class Solution {\n    public boolean isValid(String s) {\n        return false;\n    }\n}\n',
      cpp: 'class Solution {\npublic:\n    bool isValid(string s) {\n        return false;\n    }\n};\n',
    },
    functionName: 'isValid',
    testCases: [
      { input: ['()[]{}'], expectedOutput: true },
      { input: ['(]'], expectedOutput: false },
    ],
    hiddenTests: [{ input: ['([{}])'], expectedOutput: true }],
    editorial: 'Push opening brackets and pop when a closing bracket appears. If mismatch or leftover items remain, return false.',
    editorialSections: [
      { title: 'Approach', content: 'Use a stack to track unmatched opening brackets. Every closing bracket must close the most recent opening bracket.' },
      { title: 'Failure Cases', content: 'The string is invalid if a closing bracket appears with an empty stack or the top of the stack is the wrong opening bracket.' },
      { title: 'Complexity', content: 'Time O(n), space O(n).' },
    ],
    complexity: { time: 'O(n)', space: 'O(n)' },
    estimatedMinutes: 15,
    acceptanceRate: 41.8,
    order: 2,
  }),
  withSharedMetadata({
    title: 'Binary Search',
    slug: 'binary-search',
    difficulty: 'easy',
    category: 'Searching',
    topic: 'Binary Search',
    tags: ['binary-search'],
    companyTags: ['Google', 'Bloomberg'],
    patterns: ['Binary search'],
    statement:
      'Given a sorted array of integers nums and a target value, return the index if the target is found. Otherwise, return -1.',
    constraints: ['1 <= nums.length <= 10^4', 'nums is sorted in ascending order.'],
    hints: ['Maintain left and right pointers.', 'Check the middle and discard half the search space each step.'],
    examples: [{ input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4.' }],
    starterCode: {
      javascript: 'function search(nums, target) {\n  // your code here\n}\n',
      python: 'def search(nums, target):\n    # your code here\n    pass\n',
      java: 'class Solution {\n    public int search(int[] nums, int target) {\n        return -1;\n    }\n}\n',
      cpp: 'class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        return -1;\n    }\n};\n',
    },
    functionName: 'search',
    testCases: [
      { input: [[-1, 0, 3, 5, 9, 12], 9], expectedOutput: 4 },
      { input: [[-1, 0, 3, 5, 9, 12], 2], expectedOutput: -1 },
    ],
    hiddenTests: [{ input: [[5], 5], expectedOutput: 0 }],
    editorial: 'Classic binary search with left, right, and mid pointers.',
    editorialSections: [
      { title: 'Approach', content: 'Keep narrowing the search interval by comparing the target with the middle element.' },
      { title: 'Boundary Rules', content: 'Be consistent about whether your interval is inclusive on both ends so you do not skip indices.' },
      { title: 'Complexity', content: 'Time O(log n), space O(1).' },
    ],
    complexity: { time: 'O(log n)', space: 'O(1)' },
    estimatedMinutes: 15,
    acceptanceRate: 57.6,
    order: 3,
  }),
  withSharedMetadata({
    title: 'Merge Intervals',
    slug: 'merge-intervals',
    difficulty: 'medium',
    category: 'Intervals',
    topic: 'Intervals',
    tags: ['array', 'sorting'],
    companyTags: ['Facebook', 'LinkedIn', 'Amazon'],
    patterns: ['Sort and sweep'],
    statement:
      'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals.',
    constraints: ['1 <= intervals.length <= 10^4', '0 <= start_i <= end_i <= 10^4'],
    hints: ['Sort intervals by start.', 'Compare the current interval with the last merged interval.'],
    examples: [{ input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]', output: '[[1,6],[8,10],[15,18]]', explanation: '[1,3] and [2,6] overlap, so merge them into [1,6].' }],
    starterCode: {
      javascript: 'function merge(intervals) {\n  // your code here\n}\n',
      python: 'def merge(intervals):\n    # your code here\n    pass\n',
      java: 'class Solution {\n    public int[][] merge(int[][] intervals) {\n        return intervals;\n    }\n}\n',
      cpp: 'class Solution {\npublic:\n    vector<vector<int>> merge(vector<vector<int>>& intervals) {\n        return intervals;\n    }\n};\n',
    },
    functionName: 'merge',
    testCases: [{ input: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expectedOutput: [[1, 6], [8, 10], [15, 18]] }],
    hiddenTests: [{ input: [[[1, 4], [4, 5]]], expectedOutput: [[1, 5]] }],
    editorial: 'Sort by start time, then either append a new interval or merge into the last one.',
    editorialSections: [
      { title: 'Approach', content: 'Sort intervals by start time, then sweep from left to right while merging any overlap into the latest interval.' },
      { title: 'Key Insight', content: 'Once sorted, overlapping intervals must appear next to each other.' },
      { title: 'Complexity', content: 'Time O(n log n), space O(n) in the output array.' },
    ],
    complexity: { time: 'O(n log n)', space: 'O(n)' },
    estimatedMinutes: 25,
    acceptanceRate: 47.1,
    order: 4,
  }),
  withSharedMetadata({
    title: 'Longest Substring Without Repeating Characters',
    slug: 'longest-substring-without-repeating-characters',
    difficulty: 'medium',
    category: 'Sliding Window',
    topic: 'Sliding Window',
    tags: ['hash-map', 'sliding-window', 'string'],
    companyTags: ['Amazon', 'Adobe', 'Google'],
    patterns: ['Sliding window', 'Last seen index'],
    statement:
      'Given a string s, find the length of the longest substring without repeating characters.',
    constraints: ['0 <= s.length <= 5 * 10^4', 's consists of English letters, digits, symbols and spaces.'],
    hints: ['Use a sliding window.', 'Track the last seen index for each character.'],
    examples: [{ input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' }],
    starterCode: {
      javascript: 'function lengthOfLongestSubstring(s) {\n  // your code here\n}\n',
      python: 'def length_of_longest_substring(s):\n    # your code here\n    pass\n',
      java: 'class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        return 0;\n    }\n}\n',
      cpp: 'class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        return 0;\n    }\n};\n',
    },
    functionName: 'lengthOfLongestSubstring',
    testCases: [
      { input: ['abcabcbb'], expectedOutput: 3 },
      { input: ['bbbbb'], expectedOutput: 1 },
    ],
    hiddenTests: [{ input: ['pwwkew'], expectedOutput: 3 }],
    editorial: 'Expand the right pointer and move the left pointer when you see a repeated character inside the window.',
    editorialSections: [
      { title: 'Approach', content: 'Keep a window with unique characters. When a repeated character appears, move the left pointer past its previous occurrence.' },
      { title: 'State to Track', content: 'Store the latest index for each character so the left pointer only moves forward.' },
      { title: 'Complexity', content: 'Time O(n), space O(min(n, alphabet size)).' },
    ],
    complexity: { time: 'O(n)', space: 'O(n)' },
    estimatedMinutes: 25,
    acceptanceRate: 37.9,
    order: 5,
  }),
  withSharedMetadata({
    title: 'Product of Array Except Self',
    slug: 'product-of-array-except-self',
    difficulty: 'medium',
    category: 'Arrays',
    topic: 'Prefix and Suffix',
    tags: ['array', 'prefix-product'],
    companyTags: ['Meta', 'Lyft', 'Microsoft'],
    patterns: ['Prefix product', 'Suffix product'],
    statement:
      'Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i].',
    constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30', 'The product of any prefix or suffix fits in a 32-bit integer.'],
    hints: ['Think prefix products and suffix products.', 'Avoid division to handle zeros cleanly.'],
    examples: [{ input: 'nums = [1,2,3,4]', output: '[24,12,8,6]', explanation: 'Each index uses the product of all values before and after it.' }],
    starterCode: {
      javascript: 'function productExceptSelf(nums) {\n  // your code here\n}\n',
      python: 'def product_except_self(nums):\n    # your code here\n    pass\n',
      java: 'class Solution {\n    public int[] productExceptSelf(int[] nums) {\n        return new int[]{};\n    }\n}\n',
      cpp: 'class Solution {\npublic:\n    vector<int> productExceptSelf(vector<int>& nums) {\n        return {};\n    }\n};\n',
    },
    functionName: 'productExceptSelf',
    testCases: [{ input: [[1, 2, 3, 4]], expectedOutput: [24, 12, 8, 6] }],
    hiddenTests: [{ input: [[-1, 1, 0, -3, 3]], expectedOutput: [0, 0, 9, 0, 0] }],
    editorial: 'Build prefix products from left to right, then multiply them by suffix products from right to left.',
    editorialSections: [
      { title: 'Approach', content: 'Store prefix products in the output array, then sweep backward while multiplying by a running suffix product.' },
      { title: 'Why It Matters', content: 'This removes the need for division and naturally handles zeros.' },
      { title: 'Complexity', content: 'Time O(n), extra space O(1) if output array is not counted.' },
    ],
    complexity: { time: 'O(n)', space: 'O(1) extra' },
    estimatedMinutes: 25,
    acceptanceRate: 64.2,
    order: 6,
  }),
  withSharedMetadata({
    title: 'Kth Largest Element in an Array',
    slug: 'kth-largest-element-in-an-array',
    difficulty: 'medium',
    category: 'Heaps',
    topic: 'Heaps',
    tags: ['heap', 'priority-queue', 'quickselect'],
    companyTags: ['Amazon', 'Microsoft', 'Apple'],
    patterns: ['Heap', 'Selection'],
    statement:
      'Given an integer array nums and an integer k, return the kth largest element in the array.',
    constraints: ['1 <= k <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    hints: ['A min-heap of size k is enough.', 'Quickselect is another option if you want average linear time.'],
    examples: [{ input: 'nums = [3,2,1,5,6,4], k = 2', output: '5', explanation: 'The 2nd largest element is 5.' }],
    starterCode: {
      javascript: 'function findKthLargest(nums, k) {\n  // your code here\n}\n',
      python: 'def find_kth_largest(nums, k):\n    # your code here\n    pass\n',
      java: 'class Solution {\n    public int findKthLargest(int[] nums, int k) {\n        return -1;\n    }\n}\n',
      cpp: 'class Solution {\npublic:\n    int findKthLargest(vector<int>& nums, int k) {\n        return -1;\n    }\n};\n',
    },
    functionName: 'findKthLargest',
    testCases: [{ input: [[3, 2, 1, 5, 6, 4], 2], expectedOutput: 5 }],
    hiddenTests: [{ input: [[3, 2, 3, 1, 2, 4, 5, 5, 6], 4], expectedOutput: 4 }],
    editorial: 'Maintain a min-heap of size k. Whenever the heap grows beyond k, remove the smallest element.',
    editorialSections: [
      { title: 'Approach', content: 'Push each number into a min-heap. Trim the heap to size k so it stores the k largest values seen so far.' },
      { title: 'Tradeoff', content: 'Heap is simpler to implement than quickselect and is reliable even in interview pressure.' },
      { title: 'Complexity', content: 'Time O(n log k), space O(k).' },
    ],
    complexity: { time: 'O(n log k)', space: 'O(k)' },
    estimatedMinutes: 30,
    acceptanceRate: 67.3,
    order: 7,
  }),
  withSharedMetadata({
    title: 'Number of Islands',
    slug: 'number-of-islands',
    difficulty: 'medium',
    category: 'Graphs',
    topic: 'Graphs',
    tags: ['graph', 'dfs', 'bfs', 'matrix'],
    companyTags: ['Amazon', 'Google', 'TikTok'],
    patterns: ['Flood fill', 'Connected components'],
    statement:
      'Given an m x n 2D binary grid grid which represents a map of land and water, return the number of islands.',
    constraints: ['1 <= m, n <= 300', 'grid[i][j] is 0 or 1.'],
    hints: ['Whenever you find land, explore and mark the whole island.', 'DFS or BFS both work here.'],
    examples: [{ input: 'grid = [["1","1","0"],["1","0","0"],["0","0","1"]]', output: '2', explanation: 'There are two disconnected groups of land.' }],
    starterCode: {
      javascript: 'function numIslands(grid) {\n  // your code here\n}\n',
      python: 'def num_islands(grid):\n    # your code here\n    pass\n',
      java: 'class Solution {\n    public int numIslands(char[][] grid) {\n        return 0;\n    }\n}\n',
      cpp: 'class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        return 0;\n    }\n};\n',
    },
    functionName: 'numIslands',
    testCases: [{ input: [[['1', '1', '1'], ['0', '1', '0'], ['1', '0', '1']]], expectedOutput: 3 }],
    hiddenTests: [{ input: [[['1', '1', '0', '0'], ['1', '0', '0', '1'], ['0', '0', '1', '1']]], expectedOutput: 3 }],
    editorial: 'Scan the grid. Every unseen land cell starts a DFS/BFS that marks all connected land.',
    editorialSections: [
      { title: 'Approach', content: 'Loop over each cell. When you see land, increment the island count and run DFS or BFS to mark every cell in that island.' },
      { title: 'Common Pitfall', content: 'Do not recount cells already visited as part of a previous island.' },
      { title: 'Complexity', content: 'Time O(m*n), space O(m*n) worst case due to recursion or queue.' },
    ],
    complexity: { time: 'O(m*n)', space: 'O(m*n)' },
    estimatedMinutes: 30,
    acceptanceRate: 61.5,
    order: 8,
  }),
  withSharedMetadata({
    title: 'LRU Cache',
    slug: 'lru-cache',
    difficulty: 'hard',
    category: 'Design',
    topic: 'Design',
    tags: ['design', 'hash-map', 'linked-list'],
    companyTags: ['Amazon', 'Google', 'Adobe'],
    patterns: ['Hash map + doubly linked list'],
    statement:
      'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.',
    constraints: ['1 <= capacity <= 3000', 'At most 2 * 10^5 calls will be made.'],
    hints: ['Hash map gives O(1) lookup.', 'Doubly linked list lets you move nodes to the front in O(1).'],
    examples: [{ input: 'LRUCache(2), put(1,1), put(2,2), get(1), put(3,3), get(2)', output: '[null,null,null,1,null,-1]', explanation: 'Key 2 is evicted after key 3 is inserted.' }],
    starterCode: {
      javascript: 'class LRUCache {\n  constructor(capacity) {\n    // your code here\n  }\n\n  get(key) {\n    // your code here\n  }\n\n  put(key, value) {\n    // your code here\n  }\n}\n',
      python: 'class LRUCache:\n    def __init__(self, capacity):\n        # your code here\n        pass\n\n    def get(self, key):\n        # your code here\n        pass\n\n    def put(self, key, value):\n        # your code here\n        pass\n',
      java: 'class LRUCache {\n    public LRUCache(int capacity) {\n    }\n\n    public int get(int key) {\n        return -1;\n    }\n\n    public void put(int key, int value) {\n    }\n}\n',
      cpp: 'class LRUCache {\npublic:\n    LRUCache(int capacity) {\n    }\n\n    int get(int key) {\n        return -1;\n    }\n\n    void put(int key, int value) {\n    }\n};\n',
    },
    functionName: 'LRUCache',
    testCases: [],
    hiddenTests: [],
    editorial: 'Use a doubly linked list to keep recency order and a hash map for O(1) node lookup.',
    editorialSections: [
      { title: 'Approach', content: 'Store key-node pairs in a hash map. Use a doubly linked list to move recently used nodes to the front and evict from the tail.' },
      { title: 'Design Note', content: 'This problem focuses more on data structure design than pure algorithmic loops.' },
      { title: 'Complexity', content: 'Each get and put runs in O(1) time.' },
    ],
    complexity: { time: 'O(1) per operation', space: 'O(capacity)' },
    estimatedMinutes: 40,
    acceptanceRate: 43.9,
    order: 9,
  }),
];

const ensureStarterProblems = async () => {
  await Promise.all(
    starterProblems.map((problem) =>
      DsaProblem.findOneAndUpdate(
        { slug: problem.slug },
        { $set: problem },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );
};

const evaluateAttemptStatus = (problem, code = '', notes = '') => {
  const source = `${code}\n${notes}`.toLowerCase();
  const title = problem.title.toLowerCase();

  if (source.includes('todo') || source.trim().length < 12) {
    return 'draft';
  }

  if (
    (title.includes('two sum') && (source.includes('map') || source.includes('hash'))) ||
    (title.includes('valid parentheses') && source.includes('stack')) ||
    (title.includes('binary search') && source.includes('mid')) ||
    (title.includes('merge intervals') && source.includes('sort')) ||
    (title.includes('longest substring') && source.includes('window')) ||
    (title.includes('product of array') && source.includes('prefix')) ||
    (title.includes('kth largest') && (source.includes('heap') || source.includes('priority'))) ||
    (title.includes('number of islands') && (source.includes('dfs') || source.includes('bfs')))
  ) {
    return 'solved';
  }

  return 'attempted';
};

const buildRuntime = (status) => {
  if (status !== 'solved') return '';
  return `${Math.floor(Math.random() * 40) + 12} ms`;
};

const buildMemory = (status) => {
  if (status !== 'solved') return '';
  return `${Math.floor(Math.random() * 12) + 38} MB`;
};

const calculateScorePercent = ({
  passedCount = 0,
  totalTests = 0,
}) => {
  if (!totalTests) return 0;
  return Math.round((passedCount / totalTests) * 100);
};

module.exports = {
  ensureStarterProblems,
  evaluateAttemptStatus,
  buildRuntime,
  buildMemory,
  calculateScorePercent,
};
