// api.js — Zero-database browser localStorage API client
// Replaces external MySQL backend with self-contained browser storage & mock data.

'use strict';

const STORAGE_USERS_KEY     = 'ivolunteer_mock_users';
const STORAGE_DONATIONS_KEY = 'ivolunteer_mock_donations';
const TOKEN_KEY             = 'iv_token';

/* ─── Seed Data ─── */
const INITIAL_USERS = [
  {
    id: 1,
    name: 'Priya Sharma',
    email: 'demo@ivolunteer.org',
    password: 'password123',
    phone: '+91 98765 43210',
    city: 'Mumbai',
    bio: 'Passionate community volunteer supporting food rescue and animal welfare initiatives.',
    isVolunteer: true,
    joinedDate: 'March 2026',
    volunteerSubProfile: {
      volunteerId: 'VOL-2026-1042',
      status: 'Active Volunteer',
      joinedDate: '2026-03-15',
      hoursContributed: 24.5,
      drivesAttended: 5,
      availability: 'weekends',
      interests: ['foodDrive', 'clothingDrive', 'teaching'],
      skills: ['Community Outreach', 'Event Coordination', 'Logistics'],
      badges: [
        { name: 'First Drive', icon: '🌱', desc: 'Attended first community drive' },
        { name: 'Community Star', icon: '⭐', desc: 'Completed over 20 volunteer hours' },
        { name: 'Kind Heart', icon: '❤️', desc: 'Recognised for dedicated community support' }
      ],
      upcomingDrives: [
        { id: 1, title: 'Weekend Food Distribution Drive', date: '2026-09-12', role: 'Distribution Lead' }
      ]
    }
  },
  {
    id: 2,
    name: 'Rahul Verma',
    email: 'rahul@example.com',
    password: 'password123',
    phone: '+91 91234 56789',
    city: 'New Delhi',
    bio: 'Active donor contributing seasonal clothing, blankets, and school books.',
    isVolunteer: false,
    joinedDate: 'April 2026',
    volunteerSubProfile: null
  }
];

const INITIAL_DONATIONS = [
  {
    id: 101,
    userId: 1,
    donationRef: 'DON-20260815-402',
    type: 'clothes',
    description: 'Winter jackets, warm blankets and woollen sweaters for children',
    quantity: '3 boxes (approx 25 items)',
    pickupAddress: 'Flat 402, Sea Green Apts, Worli, Mumbai',
    ngoId: 2,
    ngoName: 'Sunshine Orphanage',
    status: 'delivered',
    date: '2026-08-15',
    lastUpdated: '2026-08-18'
  },
  {
    id: 102,
    userId: 1,
    donationRef: 'DON-20260828-819',
    type: 'food',
    description: 'Packets of rice, lentils, wheat flour and cooking oil',
    quantity: '15 kg grocery kit',
    pickupAddress: 'Flat 402, Sea Green Apts, Worli, Mumbai',
    ngoId: 1,
    ngoName: 'Helping Hands Foundation',
    status: 'pickedUp',
    date: '2026-08-28',
    lastUpdated: '2026-08-30'
  },
  {
    id: 103,
    userId: 1,
    donationRef: 'DON-20260902-154',
    type: 'books',
    description: 'School textbooks (Classes 6-10) and general knowledge storybooks',
    quantity: '20 books',
    pickupAddress: 'Flat 402, Sea Green Apts, Worli, Mumbai',
    ngoId: 7,
    ngoName: 'Vidya Daan Foundation',
    status: 'requested',
    date: '2026-09-02',
    lastUpdated: '2026-09-02'
  }
];

/* ─── LocalStorage Helpers ─── */
function getStoredUsers() {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(INITIAL_USERS));
      return INITIAL_USERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_USERS;
  }
}

function saveStoredUsers(users) {
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
}

function getStoredDonations() {
  try {
    const raw = localStorage.getItem(STORAGE_DONATIONS_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_DONATIONS_KEY, JSON.stringify(INITIAL_DONATIONS));
      return INITIAL_DONATIONS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_DONATIONS;
  }
}

function saveStoredDonations(donations) {
  try {
    localStorage.setItem(STORAGE_DONATIONS_KEY, JSON.stringify(donations));
  } catch (e) {
    console.error('Failed to save donations to localStorage', e);
  }
}

function getCurrentUserId() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  const match = token.match(/^mock_token_(\d+)_/);
  return match ? parseInt(match[1], 10) : null;
}

function createError(message, status = 400) {
  const err = new Error(message);
  err.response = {
    status,
    data: { error: message }
  };
  return err;
}

function delay(ms = 120) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function generateDonationRef() {
  return 'DON-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

function generateVolunteerId() {
  return 'VOL-2026-' + Math.floor(1000 + Math.random() * 9000);
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function joinedMonthStr() {
  return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
}

/* ─── Mock API Object ─── */
const api = {
  // Support interceptor stubs for backward compatibility
  interceptors: {
    request: { use: () => {} },
    response: { use: () => {} }
  },

  async get(url) {
    await delay();
    const cleanUrl = url.replace(/^\/api/, '');

    // Health check
    if (cleanUrl === '/health') {
      return { data: { status: 'ok', engine: 'localStorage-mock', time: new Date().toISOString() } };
    }

    // Profile endpoint
    if (cleanUrl === '/profile') {
      const userId = getCurrentUserId();
      if (!userId) throw createError('No token provided.', 401);

      const users = getStoredUsers();
      const user = users.find((u) => u.id === userId);
      if (!user) {
        localStorage.removeItem(TOKEN_KEY);
        throw createError('User not found.', 404);
      }

      const { password: _, ...safeUser } = user;
      return { data: safeUser };
    }

    // Donations endpoint
    if (cleanUrl === '/donations') {
      const userId = getCurrentUserId();
      if (!userId) throw createError('No token provided.', 401);

      const donations = getStoredDonations();
      const userDonations = donations
        .filter((d) => d.userId === userId)
        .sort((a, b) => (b.id || 0) - (a.id || 0));

      return { data: userDonations };
    }

    throw createError(`Not Found: GET ${url}`, 404);
  },

  async post(url, body = {}) {
    await delay();
    const cleanUrl = url.replace(/^\/api/, '');

    // Register
    if (cleanUrl === '/auth/register') {
      const { name, email, password, phone = '', city = '', isVolunteer = false } = body;

      if (!name || !email || !password) {
        throw createError('Name, email, and password are required.', 400);
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw createError('Invalid email address.', 400);
      }
      if (password.length < 6) {
        throw createError('Password must be at least 6 characters.', 400);
      }

      const users = getStoredUsers();
      const lowerEmail = email.toLowerCase().trim();
      if (users.some((u) => u.email.toLowerCase() === lowerEmail)) {
        throw createError('An account with this email already exists.', 409);
      }

      const newId = Date.now();
      const joinedDate = joinedMonthStr();

      let volunteerSubProfile = null;
      if (isVolunteer) {
        volunteerSubProfile = {
          volunteerId: generateVolunteerId(),
          status: 'Active Volunteer',
          joinedDate: todayStr(),
          hoursContributed: 0,
          drivesAttended: 0,
          availability: 'weekends',
          interests: ['foodDrive', 'clothingDrive'],
          skills: ['Community Outreach'],
          badges: [
            { name: 'New Volunteer', icon: '🌱', desc: 'Joined iVolunteer active volunteer network' }
          ],
          upcomingDrives: []
        };
      }

      const newUser = {
        id: newId,
        name: name.trim(),
        email: lowerEmail,
        password,
        phone: phone.trim(),
        city: city.trim(),
        bio: '',
        isVolunteer: !!isVolunteer,
        joinedDate,
        volunteerSubProfile
      };

      users.push(newUser);
      saveStoredUsers(users);

      const token = `mock_token_${newId}_${Date.now()}`;
      localStorage.setItem(TOKEN_KEY, token);

      const { password: _, ...safeUser } = newUser;
      return {
        data: {
          message: 'Account created successfully.',
          token,
          user: safeUser
        }
      };
    }

    // Login
    if (cleanUrl === '/auth/login') {
      const { email, password } = body;
      if (!email || !password) {
        throw createError('Email and password are required.', 400);
      }

      const users = getStoredUsers();
      const lowerEmail = email.toLowerCase().trim();
      const user = users.find((u) => u.email.toLowerCase() === lowerEmail);

      if (!user) {
        throw createError('No account found with this email address.', 401);
      }
      if (user.password !== password) {
        throw createError('Incorrect password. Please try again.', 401);
      }

      const token = `mock_token_${user.id}_${Date.now()}`;
      localStorage.setItem(TOKEN_KEY, token);

      const { password: _, ...safeUser } = user;
      return {
        data: {
          message: 'Signed in successfully.',
          token,
          user: safeUser
        }
      };
    }

    // Create Donation
    if (cleanUrl === '/donations') {
      const userId = getCurrentUserId();
      if (!userId) throw createError('No token provided.', 401);

      const { type, description, quantity, pickupAddress, ngoId, ngoName } = body;
      if (!type || !description || !quantity || !pickupAddress) {
        throw createError('Type, description, quantity, and pickup address are required.', 400);
      }

      const donations = getStoredDonations();
      const donationRef = generateDonationRef();
      const today = todayStr();

      const newDonation = {
        id: Date.now(),
        userId,
        donationRef,
        type,
        description: description.trim(),
        quantity: quantity.trim(),
        pickupAddress: pickupAddress.trim(),
        ngoId: ngoId || null,
        ngoName: ngoName || '',
        status: 'requested',
        date: today,
        lastUpdated: today
      };

      donations.unshift(newDonation);
      saveStoredDonations(donations);

      return {
        data: {
          message: 'Donation request submitted successfully.',
          donationRef,
          id: newDonation.id
        }
      };
    }

    // Activate Volunteer
    if (cleanUrl === '/volunteer/activate') {
      const userId = getCurrentUserId();
      if (!userId) throw createError('No token provided.', 401);

      const users = getStoredUsers();
      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) throw createError('User not found.', 404);

      const user = users[userIndex];
      const volId = user.volunteerSubProfile?.volunteerId || generateVolunteerId();

      user.isVolunteer = true;
      user.volunteerSubProfile = {
        volunteerId: volId,
        status: 'Active Volunteer',
        joinedDate: user.volunteerSubProfile?.joinedDate || todayStr(),
        hoursContributed: user.volunteerSubProfile?.hoursContributed || 0,
        drivesAttended: user.volunteerSubProfile?.drivesAttended || 0,
        availability: user.volunteerSubProfile?.availability || 'weekends',
        interests: user.volunteerSubProfile?.interests || ['foodDrive', 'clothingDrive'],
        skills: user.volunteerSubProfile?.skills || ['Community Support'],
        badges: user.volunteerSubProfile?.badges || [
          { name: 'First Drive', icon: '🌱', desc: 'Joined iVolunteer active volunteer network' },
          { name: 'Kind Heart', icon: '❤️', desc: 'Activated volunteer subprofile' }
        ],
        upcomingDrives: user.volunteerSubProfile?.upcomingDrives || []
      };

      users[userIndex] = user;
      saveStoredUsers(users);

      return {
        data: {
          message: 'Volunteer subprofile activated.',
          volunteerId: volId
        }
      };
    }

    throw createError(`Not Found: POST ${url}`, 404);
  },

  async put(url, body = {}) {
    await delay();
    const cleanUrl = url.replace(/^\/api/, '');

    // Update Profile
    if (cleanUrl === '/profile') {
      const userId = getCurrentUserId();
      if (!userId) throw createError('No token provided.', 401);

      const { name, phone = '', city = '', bio = '' } = body;
      if (!name || !name.trim()) {
        throw createError('Name is required.', 400);
      }

      const users = getStoredUsers();
      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) throw createError('User not found.', 404);

      users[userIndex] = {
        ...users[userIndex],
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        bio: bio.trim()
      };

      saveStoredUsers(users);
      return { data: { message: 'Profile updated successfully.' } };
    }

    // Update Volunteer Profile
    if (cleanUrl === '/volunteer/profile') {
      const userId = getCurrentUserId();
      if (!userId) throw createError('No token provided.', 401);

      const { availability = 'weekends', interests = [], skills = [] } = body;

      const users = getStoredUsers();
      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) throw createError('User not found.', 404);

      const user = users[userIndex];
      if (!user.volunteerSubProfile) {
        user.isVolunteer = true;
        user.volunteerSubProfile = {
          volunteerId: generateVolunteerId(),
          status: 'Active Volunteer',
          joinedDate: todayStr(),
          hoursContributed: 0,
          drivesAttended: 0,
          availability,
          interests,
          skills,
          badges: [{ name: 'New Volunteer', icon: '🌱', desc: 'Joined active volunteer network' }],
          upcomingDrives: []
        };
      } else {
        user.volunteerSubProfile.availability = availability;
        user.volunteerSubProfile.interests    = interests;
        user.volunteerSubProfile.skills       = skills;
      }

      users[userIndex] = user;
      saveStoredUsers(users);

      return { data: { message: 'Volunteer profile updated.' } };
    }

    throw createError(`Not Found: PUT ${url}`, 404);
  }
};

export default api;
