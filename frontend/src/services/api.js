// api.js — Zero-database browser in-memory API client
// Replaces external MySQL backend with self-contained in-memory mock data.

'use strict';

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
        { name: 'First Drive', icon: '⭐', desc: 'Attended first community drive' },
        { name: 'Community Star', icon: '🌟', desc: 'Completed over 25 volunteer hours' },
        { name: 'Tricity Champion', icon: '🏆', desc: 'Active volunteer in Chandigarh & Punjab region' }
      ],
      upcomingDrives: [
        {
          id: 2,
          title: 'Weekend Langar & Rations Drive at PGI',
          date: '2026-10-24',
          status: 'Confirmed',
          role: 'Distribution Coordinator',
          location: 'Outside PGIMER Emergency & GMCH 32, Chandigarh',
          organizer: 'Sri Guru Granth Sahib Sewa Society (Tera Hi Tera)'
        }
      ],
      attendedDrives: [
        {
          driveId: 1,
          driveTitle: 'Sukhna Lake Eco-Cleanup & Tree Plantation',
          date: '2026-08-16',
          location: 'Sukhna Lake & Nature Reserve, Sector 1, Chandigarh',
          organizer: 'Yuvsatta & Chandigarh Eco-Volunteers',
          hoursLogged: 4.5
        },
        {
          driveId: 3,
          driveTitle: 'Winter Warmth Collection & Distribution Camp',
          date: '2026-08-28',
          location: 'Sector 17 Plaza & Dhanas Colony, Chandigarh',
          organizer: 'Tammana NGO',
          hoursLogged: 5.0
        }
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

let currentToken = null;

/* ─── localStorage Keys ─── */
const LS_USERS     = 'ivolunteer_users_v2';
const LS_DONATIONS = 'ivolunteer_donations_v2';

/* ─── Seed-once helpers with automatic legacy migration ─── */
function seedUsersOnce() {
  try {
    let users = [];
    const raw = localStorage.getItem(LS_USERS);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) users = parsed;
      } catch {}
    }

    // Automatically migrate any users from legacy storage keys (e.g. ivolunteer_mock_users_v2)
    const legacyKeys = ['ivolunteer_mock_users_v2', 'ivolunteer_mock_users', 'ivolunteer_users'];
    legacyKeys.forEach(key => {
      try {
        const legacyRaw = localStorage.getItem(key);
        if (legacyRaw) {
          const legacyUsers = JSON.parse(legacyRaw);
          if (Array.isArray(legacyUsers)) {
            legacyUsers.forEach(lu => {
              if (lu && lu.email && !users.some(u => u.email?.toLowerCase() === lu.email.toLowerCase())) {
                users.push(lu);
              }
            });
          }
        }
      } catch {}
    });

    if (!users.length) {
      users = JSON.parse(JSON.stringify(INITIAL_USERS));
    } else {
      // Ensure initial demo users exist if not present
      INITIAL_USERS.forEach(iu => {
        if (!users.some(u => u.id === iu.id || u.email?.toLowerCase() === iu.email.toLowerCase())) {
          users.push(iu);
        }
      });
    }

    // Clean up demo drives from non-demo accounts
    users.forEach(u => {
      if (u.id !== 1 && u.isVolunteer && u.volunteerSubProfile?.attendedDrives) {
        const hadCopied = u.volunteerSubProfile.attendedDrives.some(
          d => d.driveId === 1 || d.driveId === 3
        );
        if (hadCopied) {
          u.volunteerSubProfile.attendedDrives = [];
        }
      }
      if (u.id === 1 && u.volunteerSubProfile?.upcomingDrives?.[0] && !u.volunteerSubProfile.upcomingDrives[0].status) {
        u.volunteerSubProfile.upcomingDrives[0].status = 'Confirmed';
        u.volunteerSubProfile.upcomingDrives[0].date = '2026-10-24';
      }
    });

    localStorage.setItem(LS_USERS, JSON.stringify(users));
    localStorage.setItem('ivolunteer_mock_users_v2', JSON.stringify(users));
  } catch { /* storage blocked */ }
}

function seedDonationsOnce() {
  try {
    let donations = [];
    const raw = localStorage.getItem(LS_DONATIONS);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) donations = parsed;
      } catch {}
    }

    const legacyKeys = ['ivolunteer_mock_donations_v2', 'ivolunteer_mock_donations', 'ivolunteer_donations'];
    legacyKeys.forEach(key => {
      try {
        const legacyRaw = localStorage.getItem(key);
        if (legacyRaw) {
          const legacyDonations = JSON.parse(legacyRaw);
          if (Array.isArray(legacyDonations)) {
            legacyDonations.forEach(ld => {
              if (ld && ld.id && !donations.some(d => d.id === ld.id)) {
                donations.push(ld);
              }
            });
          }
        }
      } catch {}
    });

    if (!donations.length) {
      donations = JSON.parse(JSON.stringify(INITIAL_DONATIONS));
    }

    localStorage.setItem(LS_DONATIONS, JSON.stringify(donations));
    localStorage.setItem('ivolunteer_mock_donations_v2', JSON.stringify(donations));
  } catch { /* storage blocked */ }
}

// Run once at module load
seedUsersOnce();
seedDonationsOnce();

export function setToken(token, remember = true) {
  currentToken = token;
  try {
    if (token) {
      if (remember) {
        localStorage.setItem('ivolunteer_token', token);
        localStorage.setItem('iv_token', token);
        sessionStorage.removeItem('ivolunteer_token');
        sessionStorage.removeItem('iv_token');
      } else {
        sessionStorage.setItem('ivolunteer_token', token);
        sessionStorage.setItem('iv_token', token);
        localStorage.removeItem('ivolunteer_token');
        localStorage.removeItem('iv_token');
      }
    } else {
      localStorage.removeItem('ivolunteer_token');
      localStorage.removeItem('iv_token');
      sessionStorage.removeItem('ivolunteer_token');
      sessionStorage.removeItem('iv_token');
    }
  } catch {}
}

export function clearToken() {
  currentToken = null;
  try {
    localStorage.removeItem('ivolunteer_token');
    localStorage.removeItem('iv_token');
    sessionStorage.removeItem('ivolunteer_token');
    sessionStorage.removeItem('iv_token');
  } catch {}
}

export function getToken() {
  if (!currentToken) {
    try {
      currentToken =
        localStorage.getItem('ivolunteer_token') ||
        localStorage.getItem('iv_token') ||
        sessionStorage.getItem('ivolunteer_token') ||
        sessionStorage.getItem('iv_token') ||
        null;
    } catch {
      currentToken = null;
    }
  }
  return currentToken;
}

/* ─── localStorage Storage Helpers ─── */
function getStoredUsers() {
  try {
    const raw = localStorage.getItem(LS_USERS) || localStorage.getItem('ivolunteer_mock_users_v2');
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(INITIAL_USERS));
  } catch {
    return JSON.parse(JSON.stringify(INITIAL_USERS));
  }
}

function saveStoredUsers(users) {
  try {
    localStorage.setItem(LS_USERS, JSON.stringify(users));
    localStorage.setItem('ivolunteer_mock_users_v2', JSON.stringify(users));
  } catch { /* storage full or blocked */ }
}

function getStoredDonations() {
  try {
    const raw = localStorage.getItem(LS_DONATIONS) || localStorage.getItem('ivolunteer_mock_donations_v2');
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(INITIAL_DONATIONS));
  } catch {
    return JSON.parse(JSON.stringify(INITIAL_DONATIONS));
  }
}

function saveStoredDonations(donations) {
  try {
    localStorage.setItem(LS_DONATIONS, JSON.stringify(donations));
    localStorage.setItem('ivolunteer_mock_donations_v2', JSON.stringify(donations));
  } catch { /* storage full or blocked */ }
}

function getCurrentUserId() {
  const token = getToken();
  if (!token) return null;
  const match = token.match(/^mock_token_(\d+)/);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  const users = getStoredUsers();
  return users.some(u => u.id === id) ? id : null;
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
      return { data: { status: 'ok', engine: 'in-memory-mock', time: new Date().toISOString() } };
    }

    // Profile endpoint
    if (cleanUrl === '/profile') {
      const userId = getCurrentUserId();
      if (!userId) {
        clearToken();
        throw createError('No token provided.', 401);
      }

      const users = getStoredUsers();
      const user = users.find((u) => u.id === userId);
      if (!user) {
        clearToken();
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
        .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0) || (b.id || 0) - (a.id || 0));

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
          upcomingDrives: [],
          attendedDrives: []
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
      currentToken = token;

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
      currentToken = token;

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
        badges: user.volunteerSubProfile?.badges?.length ? user.volunteerSubProfile.badges : [
          { name: 'New Volunteer', icon: '🌱', desc: 'Joined iVolunteer active volunteer network' }
        ],
        upcomingDrives: user.volunteerSubProfile?.upcomingDrives || [],
        attendedDrives: user.volunteerSubProfile?.attendedDrives || []
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
          badges: [
            { name: 'New Volunteer', icon: '🌱', desc: 'Joined iVolunteer active volunteer network' }
          ],
          upcomingDrives: [],
          attendedDrives: []
        };
      }

      if (!Array.isArray(user.volunteerSubProfile.upcomingDrives)) {
        user.volunteerSubProfile.upcomingDrives = [];
      }

      // Check for duplicate RSVP by drive id or title in upcoming drives
      const alreadyRegistered = user.volunteerSubProfile.upcomingDrives.some(
        (d) => (drive.id && d.id === drive.id) || (drive.title && d.title === drive.title)
      );

      if (alreadyRegistered) {
        throw createError('You have already confirmed attendance for this drive.', 409);
      }

      // Also check if already attended
      const alreadyAttended = (user.volunteerSubProfile.attendedDrives || []).some(
        (d) => (drive.id && d.driveId === drive.id) || (drive.title && d.driveTitle === drive.title)
      );

      if (alreadyAttended) {
        throw createError('You have already attended this drive.', 409);
      }

      const driveEntry = {
        id: drive.id,
        title: drive.title,
        date: drive.date || todayStr(),
        location: drive.location || 'Chandigarh Tricity',
        organizer: drive.organiser || drive.organizer || 'iVolunteer Social Welfare Network',
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

    // ── Log Volunteer Hours for a Drive ──────────────────────────────
    // POST /volunteer/log-hours  { driveId, driveTitle, hours }
    if (cleanUrl === '/volunteer/log-hours') {
      const userId = getCurrentUserId();
      if (!userId) throw createError('No token provided.', 401);

      const { driveId, driveTitle, hours } = body;
      if (!hours || isNaN(Number(hours)) || Number(hours) <= 0) {
        throw createError('Please enter a valid number of hours (greater than 0).', 400);
      }
      if (!driveId && !driveTitle) {
        throw createError('Drive identifier (id or title) is required.', 400);
      }

      const hrs = Math.min(Number(hours), 12); // reasonable cap per drive log

      const users = getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) throw createError('User not found.', 404);

      const user = users[userIndex];
      if (!user.isVolunteer || !user.volunteerSubProfile) {
        throw createError('Activate your volunteer profile first.', 403);
      }

      const sub = user.volunteerSubProfile;
      if (!Array.isArray(sub.attendedDrives)) sub.attendedDrives = [];
      if (!Array.isArray(sub.upcomingDrives)) sub.upcomingDrives = [];

      // Check duplicate log
      const alreadyAttended = sub.attendedDrives.find(
        d => (driveId && d.driveId === driveId) || (driveTitle && d.driveTitle === driveTitle)
      );
      if (alreadyAttended) {
        throw createError('Hours have already been logged for this drive.', 409);
      }

      const driveMatch = sub.upcomingDrives.find(
        d => (driveId && d.id === driveId) || (driveTitle && d.title === driveTitle)
      );

      const resolvedDate = (driveMatch?.date && !driveMatch.date.toLowerCase().startsWith('every'))
        ? driveMatch.date
        : todayStr();
      const resolvedLocation = body.location || driveMatch?.location || 'Chandigarh Tricity';
      const resolvedOrganizer = body.organizer || driveMatch?.organizer || 'iVolunteer Social Welfare Network';

      // Update counters
      sub.drivesAttended = (sub.drivesAttended || 0) + 1;
      sub.hoursContributed = Math.round(((sub.hoursContributed || 0) + hrs) * 10) / 10;

      // Badge logic
      const badgesBefore = sub.badges || [];
      const newBadges = [...badgesBefore];
      const hasBadge = (name) => newBadges.some(b => b.name === name);

      if (sub.drivesAttended >= 1 && !hasBadge('First Drive')) {
        newBadges.push({ name: 'First Drive', icon: '⭐', desc: 'Attended your first community volunteer drive!' });
      }
      if (sub.hoursContributed >= 5 && !hasBadge('Community Helper')) {
        newBadges.push({ name: 'Community Helper', icon: '🤝', desc: 'Logged 5+ volunteer hours on iVolunteer.' });
      }
      if (sub.hoursContributed >= 25 && !hasBadge('Community Star')) {
        newBadges.push({ name: 'Community Star', icon: '🌟', desc: 'Completed over 25 volunteer hours — outstanding commitment!' });
      }
      if (sub.hoursContributed >= 50 && !hasBadge('Tricity Champion')) {
        newBadges.push({ name: 'Tricity Champion', icon: '🏆', desc: 'An exceptional 50+ hours contributed across the Tricity!' });
      }
      sub.badges = newBadges;

      // Update upcoming drive if present
      const upcomingIdx = sub.upcomingDrives.findIndex(
        d => (driveId && d.id === driveId) || (driveTitle && d.title === driveTitle)
      );
      if (upcomingIdx !== -1) {
        sub.upcomingDrives[upcomingIdx] = {
          ...sub.upcomingDrives[upcomingIdx],
          status: 'Attended',
          hoursLogged: hrs
        };
      }

      const savedEntry = {
        driveId: driveId || driveMatch?.id,
        driveTitle: driveTitle || driveMatch?.title,
        hoursLogged: hrs,
        date: resolvedDate,
        location: resolvedLocation,
        organizer: resolvedOrganizer
      };
      sub.attendedDrives.unshift(savedEntry);

      user.volunteerSubProfile = sub;
      users[userIndex] = user;
      saveStoredUsers(users);

      return {
        data: {
          message: `${hrs} hours logged successfully for "${savedEntry.driveTitle}".`,
          totalHours: sub.hoursContributed,
          drivesAttended: sub.drivesAttended,
          newBadgesEarned: newBadges.length - badgesBefore.length,
          badges: newBadges
        }
      };
    }

    // ── Mark Drive Attended (without manual hour entry) ──────────────
    // POST /volunteer/mark-attended  { driveId, driveTitle, hoursEstimate }
    if (cleanUrl === '/volunteer/mark-attended') {
      const userId = getCurrentUserId();
      if (!userId) throw createError('No token provided.', 401);

      const { driveId, driveTitle, hoursEstimate = 3.5, location = '', organizer = '' } = body;

      const users = getStoredUsers();
      const userIndex = users.findIndex(u => u.id === userId);
      if (userIndex === -1) throw createError('User not found.', 404);

      const user = users[userIndex];
      if (!user.isVolunteer || !user.volunteerSubProfile) {
        throw createError('Activate your volunteer profile first.', 403);
      }

      const sub = user.volunteerSubProfile;
      if (!Array.isArray(sub.attendedDrives)) sub.attendedDrives = [];
      if (!Array.isArray(sub.upcomingDrives)) sub.upcomingDrives = [];

      // Check if ALREADY attended! (Duplicate check)
      const existingAttended = sub.attendedDrives.find(
        d => (driveId && d.driveId === driveId) || (driveTitle && d.driveTitle === driveTitle)
      );
      if (existingAttended) {
        throw createError('You have already attended and logged attendance for this drive.', 409);
      }

      // Check upcoming drive match
      const upcomingIdx = sub.upcomingDrives.findIndex(
        d => (driveId && d.id === driveId) || (driveTitle && d.title === driveTitle)
      );
      const driveMatch = upcomingIdx !== -1 ? sub.upcomingDrives[upcomingIdx] : null;

      const hrs = Math.min(Number(hoursEstimate) || 3.5, 12);
      const resolvedDate = (driveMatch?.date && !driveMatch.date.toLowerCase().startsWith('every'))
        ? driveMatch.date
        : todayStr();
      const resolvedLocation = location || driveMatch?.location || 'Chandigarh Tricity';
      const resolvedOrganizer = organizer || driveMatch?.organizer || 'iVolunteer Social Welfare Network';

      // Increment drives attended and hours contributed
      sub.drivesAttended = (sub.drivesAttended || 0) + 1;
      sub.hoursContributed = Math.round(((sub.hoursContributed || 0) + hrs) * 10) / 10;

      // Badges
      const badges = sub.badges || [];
      const hasBadge = (name) => badges.some(b => b.name === name);
      if (sub.drivesAttended >= 1 && !hasBadge('First Drive')) {
        badges.push({ name: 'First Drive', icon: '⭐', desc: 'Attended your first community volunteer drive!' });
      }
      if (sub.drivesAttended >= 5 && !hasBadge('Drive Regular')) {
        badges.push({ name: 'Drive Regular', icon: '🎯', desc: 'Attended 5 drives — a reliable iVolunteer!' });
      }
      if (sub.drivesAttended >= 10 && !hasBadge('Drive Pro')) {
        badges.push({ name: 'Drive Pro', icon: '💪', desc: '10+ drives attended — true dedication!' });
      }
      if (sub.hoursContributed >= 25 && !hasBadge('Community Star')) {
        badges.push({ name: 'Community Star', icon: '🌟', desc: 'Completed over 25 volunteer hours!' });
      }
      if (sub.hoursContributed >= 50 && !hasBadge('Tricity Champion')) {
        badges.push({ name: 'Tricity Champion', icon: '🏆', desc: 'An exceptional 50+ hours contributed across the Tricity!' });
      }
      sub.badges = badges;

      // Mark in upcomingDrives list
      if (upcomingIdx !== -1) {
        sub.upcomingDrives[upcomingIdx] = {
          ...sub.upcomingDrives[upcomingIdx],
          status: 'Attended',
          hoursLogged: hrs
        };
      }

      const newAttended = {
        driveId: driveId || driveMatch?.id,
        driveTitle: driveTitle || driveMatch?.title,
        hoursLogged: hrs,
        date: resolvedDate,
        location: resolvedLocation,
        organizer: resolvedOrganizer
      };

      sub.attendedDrives.unshift(newAttended);

      user.volunteerSubProfile = sub;
      users[userIndex] = user;
      saveStoredUsers(users);

      return {
        data: {
          message: `Attendance marked for "${newAttended.driveTitle}".`,
          drivesAttended: sub.drivesAttended,
          totalHours: sub.hoursContributed
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
            { name: 'New Volunteer', icon: '🌱', desc: 'Joined iVolunteer active volunteer network' }
          ],
          upcomingDrives: [],
          attendedDrives: []
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

      const { availability = 'weekends', interests = [], skills = [], priorExperience = '' } = body;

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
          skills: Array.isArray(skills) && skills.length ? skills : ['Community Support'],
          priorExperience: priorExperience.trim(),
          badges: [{ name: 'New Volunteer', icon: '🌱', desc: 'Joined active volunteer network' }],
          upcomingDrives: [],
          attendedDrives: []
        };
      } else {
        user.volunteerSubProfile.availability = availability;
        user.volunteerSubProfile.interests    = interests;
        if (Array.isArray(skills) && skills.length) {
          user.volunteerSubProfile.skills = skills;
        }
        if (priorExperience !== undefined) {
          user.volunteerSubProfile.priorExperience = priorExperience.trim();
        }
      }

      users[userIndex] = user;
      saveStoredUsers(users);

      return { data: { message: 'Volunteer profile updated.' } };
    }

    throw createError(`Not Found: PUT ${url}`, 404);
  },

  setToken,
  clearToken,
  getToken
};

export default api;
