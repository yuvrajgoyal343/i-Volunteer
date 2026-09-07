// api.js — Zero-database browser localStorage API client
// Replaces external MySQL backend with self-contained browser storage & mock data.

'use strict';

const STORAGE_USERS_KEY     = 'ivolunteer_mock_users_v2';
const STORAGE_DONATIONS_KEY = 'ivolunteer_mock_donations_v2';
const TOKEN_KEY             = 'iv_token';

/* ─── Seed Data (Real Chandigarh Tricity & Punjab) ─── */
// NOTE: Passwords below are stored in plaintext for client-side demo purposes only.
// This is a zero-database mock architecture and is not intended for real-world authentication.
const INITIAL_USERS = [
  {
    id: 1,
    name: 'Amanpreet Singh',
    email: 'demo@ivolunteer.org',
    password: 'password123',
    phone: '+91 98140 76543',
    city: 'Chandigarh',
    bio: 'Dedicated community volunteer supporting food drives, child education, and winter warmth campaigns across Chandigarh Tricity.',
    isVolunteer: true,
    joinedDate: 'March 2026',
    volunteerSubProfile: {
      volunteerId: 'VOL-2026-1042',
      status: 'Active Volunteer',
      joinedDate: '2026-03-15',
      hoursContributed: 26.5,
      drivesAttended: 6,
      availability: 'weekends',
      interests: ['foodDrive', 'clothingDrive', 'teaching'],
      skills: ['Community Outreach', 'Logistics Coordination', 'First Aid'],
      badges: [
        { name: 'First Drive', icon: '', desc: 'Attended first community drive' },
        { name: 'Community Star', icon: '', desc: 'Completed over 25 volunteer hours' },
        { name: 'Tricity Champion', icon: '', desc: 'Active volunteer in Chandigarh & Punjab region' }
      ],
      upcomingDrives: [
        { id: 2, title: 'Weekend Langar & Rations Drive at PGI', date: '2026-09-12', role: 'Distribution Coordinator' }
      ]
    }
  },
  {
    id: 2,
    name: 'Harleen Kaur',
    email: 'harleen@example.com',
    password: 'password123',
    phone: '+91 98722 11234',
    city: 'Mohali',
    bio: 'Active donor contributing seasonal clothing, medical supplies, and school textbooks for underprivileged students in Tricity.',
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
    description: 'Warm woollen sweaters, winter jackets and thermal blankets for children',
    quantity: '2 boxes (approx 20 items)',
    pickupAddress: 'House No. 1420, Sector 35-C, Chandigarh',
    ngoId: 2,
    ngoName: 'Bal Niketan Children Home',
    status: 'delivered',
    date: '2026-08-15',
    lastUpdated: '2026-08-18'
  },
  {
    id: 102,
    userId: 1,
    donationRef: 'DON-20260828-819',
    type: 'food',
    description: 'Bags of wheat flour (Atta), Basmati rice, pulses, and mustard oil',
    quantity: '25 kg grocery kit',
    pickupAddress: 'Flat 502, Ivory Towers, Sector 70, Mohali',
    ngoId: 3,
    ngoName: 'Sri Guru Granth Sahib Sewa Society (Tera Hi Tera)',
    status: 'pickedUp',
    date: '2026-08-28',
    lastUpdated: '2026-08-30'
  },
  {
    id: 103,
    userId: 1,
    donationRef: 'DON-20260902-154',
    type: 'books',
    description: 'CBSE Class 8-10 Science & Math textbooks and blank notebooks',
    quantity: '20 textbooks & stationery kit',
    pickupAddress: 'House No. 312, Sector 15, Panchkula',
    ngoId: 1,
    ngoName: 'Tammana NGO',
    status: 'requested',
    date: '2026-09-02',
    lastUpdated: '2026-09-02'
  }
];

/* ─── LocalStorage Helpers ─── */
function getStoredUsers() {
  try {
    // Clear legacy mock data if present
    localStorage.removeItem('ivolunteer_mock_users');
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
    // Clear legacy mock data if present
    localStorage.removeItem('ivolunteer_mock_donations');
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
            { name: 'New Volunteer', icon: '', desc: 'Joined iVolunteer active volunteer network' }
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
          { name: 'First Drive', icon: '', desc: 'Joined iVolunteer active volunteer network' },
          { name: 'Kind Heart', icon: '', desc: 'Activated volunteer subprofile' }
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

    // RSVP to Volunteer Drive
    if (cleanUrl === '/volunteer/rsvp') {
      const userId = getCurrentUserId();
      if (!userId) throw createError('No token provided.', 401);

      const { drive } = body;
      if (!drive || (!drive.id && !drive.title)) {
        throw createError('Drive information is required to RSVP.', 400);
      }

      const users = getStoredUsers();
      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) throw createError('User not found.', 404);

      const user = users[userIndex];

      // Ensure volunteer subprofile exists
      if (!user.isVolunteer || !user.volunteerSubProfile) {
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
            { name: 'First Drive', icon: '', desc: 'Joined iVolunteer active volunteer network' },
            { name: 'Kind Heart', icon: '', desc: 'Activated volunteer subprofile' }
          ],
          upcomingDrives: []
        };
      }

      if (!Array.isArray(user.volunteerSubProfile.upcomingDrives)) {
        user.volunteerSubProfile.upcomingDrives = [];
      }

      // Check for duplicate RSVP by drive id or title
      const alreadyRegistered = user.volunteerSubProfile.upcomingDrives.some(
        (d) => (drive.id && d.id === drive.id) || (drive.title && d.title === drive.title)
      );

      if (alreadyRegistered) {
        throw createError('You have already confirmed attendance for this drive.', 409);
      }

      const driveEntry = {
        id: drive.id,
        title: drive.title,
        date: drive.date || todayStr(),
        location: drive.location || 'Chandigarh Tricity',
        status: 'Confirmed',
        role: drive.role || 'Volunteer'
      };

      user.volunteerSubProfile.upcomingDrives.push(driveEntry);
      users[userIndex] = user;
      saveStoredUsers(users);

      return {
        data: {
          message: 'RSVP confirmed successfully.',
          drive: driveEntry
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

      const { name, phone = '', city = '', bio = '', isVolunteer, availability } = body;
      if (!name || !name.trim()) {
        throw createError('Name is required.', 400);
      }

      const users = getStoredUsers();
      const userIndex = users.findIndex((u) => u.id === userId);
      if (userIndex === -1) throw createError('User not found.', 404);

      const existingUser = users[userIndex];
      const updatedIsVol = typeof isVolunteer === 'boolean' ? isVolunteer : existingUser.isVolunteer;
      
      let updatedSubProfile = existingUser.volunteerSubProfile;
      if (updatedIsVol && !updatedSubProfile) {
        updatedSubProfile = {
          volunteerId: generateVolunteerId(),
          status: 'Active Volunteer',
          joinedDate: todayStr(),
          hoursContributed: 0,
          drivesAttended: 0,
          availability: availability || 'weekends',
          interests: ['foodDrive', 'clothingDrive'],
          skills: ['Community Support'],
          badges: [
            { name: 'Active Volunteer', icon: '', desc: 'Joined iVolunteer active volunteer network' }
          ],
          upcomingDrives: []
        };
      } else if (updatedSubProfile && availability) {
        updatedSubProfile = {
          ...updatedSubProfile,
          availability
        };
      }

      users[userIndex] = {
        ...existingUser,
        name: name.trim(),
        phone: phone.trim(),
        city: city.trim(),
        bio: bio.trim(),
        isVolunteer: updatedIsVol,
        volunteerSubProfile: updatedSubProfile
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
          badges: [{ name: 'New Volunteer', icon: '', desc: 'Joined active volunteer network' }],
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
