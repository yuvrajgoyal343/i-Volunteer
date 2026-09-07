// server.js — iVolunteer Express REST API (mysql2 backed)
'use strict';

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const db      = require('./db');

const app        = express();
const PORT       = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'ivolunteer_secret_key_2026';

/* ─── Middleware ─── */
app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json());

/* ─── Auth Middleware ─── */
function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided.' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
}

/* ─── Helpers ─── */
function generateDonationRef() {
  return 'DON-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}
function generateVolunteerId() {
  return 'VOL-2026-' + Math.floor(1000 + Math.random() * 9000);
}
function todayStr()  { return new Date().toISOString().split('T')[0]; }
function joinedStr() { return new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }); }

function parseJsonField(val) {
  if (!val) return [];
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return []; }
}


/* ══════════════════════════════════════
   HEALTH
══════════════════════════════════════ */
app.get('/api/health', (_req, res) => res.json({ status: 'ok', engine: 'mysql2', time: new Date().toISOString() }));


/* ══════════════════════════════════════
   AUTH — REGISTER
══════════════════════════════════════ */
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone = '', city = '', isVolunteer = false } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      return res.status(400).json({ error: 'Invalid email address.' });
    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists.' });

    const passwordHash = bcrypt.hashSync(password, 10);
    const joinedDate   = joinedStr();

    const result = await db.run(
      `INSERT INTO users (name, email, password_hash, phone, city, bio, is_volunteer, joined_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), email.toLowerCase().trim(), passwordHash, phone.trim(), city.trim(), '', isVolunteer ? 1 : 0, joinedDate]
    );
    const userId = result.lastInsertRowid;

    // Create volunteer subprofile if opted in
    if (isVolunteer) {
      const volId = generateVolunteerId();
      const defaultBadges = JSON.stringify([
        { name: 'New Volunteer', icon: '🌱', desc: 'Joined iVolunteer active volunteer network' }
      ]);
      await db.run(
        `INSERT INTO volunteer_profiles (user_id, volunteer_id, interests, skills, badges, upcoming_drives, joined_date)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, volId, '["foodDrive","clothingDrive"]', '["Community Outreach"]', defaultBadges, '[]', todayStr()]
      );
    }

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({
      message: 'Account created successfully.',
      token,
      user: {
        id: userId, name: name.trim(), email: email.toLowerCase().trim(),
        phone: phone.trim(), city: city.trim(), bio: '', isVolunteer: !!isVolunteer, joinedDate
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});


/* ══════════════════════════════════════
   AUTH — LOGIN
══════════════════════════════════════ */
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required.' });

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email.toLowerCase().trim()]);
    if (!user)
      return res.status(401).json({ error: 'No account found with this email address.' });

    if (!bcrypt.compareSync(password, user.password_hash))
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    return res.json({
      message: 'Signed in successfully.',
      token,
      user: {
        id: user.id, name: user.name, email: user.email,
        phone: user.phone || '', city: user.city || '', bio: user.bio || '',
        isVolunteer: !!user.is_volunteer, joinedDate: user.joined_date
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
});


/* ══════════════════════════════════════
   PROFILE — GET
══════════════════════════════════════ */
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    let volunteerSubProfile = null;
    if (user.is_volunteer) {
      const vp = await db.get('SELECT * FROM volunteer_profiles WHERE user_id = ?', [user.id]);
      if (vp) {
        volunteerSubProfile = {
          volunteerId:      vp.volunteer_id,
          status:           vp.status,
          joinedDate:       vp.joined_date,
          hoursContributed: vp.hours || 0,
          drivesAttended:   vp.drives || 0,
          availability:     vp.availability,
          interests:        parseJsonField(vp.interests),
          skills:           parseJsonField(vp.skills),
          badges:           parseJsonField(vp.badges),
          upcomingDrives:   parseJsonField(vp.upcoming_drives)
        };
      }
    }

    return res.json({
      id: user.id, name: user.name, email: user.email,
      phone: user.phone || '', city: user.city || '', bio: user.bio || '',
      isVolunteer: !!user.is_volunteer, joinedDate: user.joined_date,
      volunteerSubProfile
    });
  } catch (err) {
    console.error('Profile GET error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});


/* ══════════════════════════════════════
   PROFILE — UPDATE
══════════════════════════════════════ */
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { name, phone, city, bio, isVolunteer } = req.body;
    if (!name || !name.trim())
      return res.status(400).json({ error: 'Name is required.' });

    if (typeof isVolunteer === 'boolean') {
      await db.run(
        'UPDATE users SET name = ?, phone = ?, city = ?, bio = ?, is_volunteer = ? WHERE id = ?',
        [name.trim(), (phone || '').trim(), (city || '').trim(), (bio || '').trim(), isVolunteer ? 1 : 0, req.userId]
      );
    } else {
      await db.run(
        'UPDATE users SET name = ?, phone = ?, city = ?, bio = ? WHERE id = ?',
        [name.trim(), (phone || '').trim(), (city || '').trim(), (bio || '').trim(), req.userId]
      );
    }
    return res.json({ message: 'Profile updated successfully.' });
  } catch (err) {
    console.error('Profile PUT error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});


/* ══════════════════════════════════════
   DONATIONS — GET (user's own)
══════════════════════════════════════ */
app.get('/api/donations', authMiddleware, async (req, res) => {
  try {
    const donations = await db.query(
      'SELECT * FROM donations WHERE user_id = ? ORDER BY id DESC',
      [req.userId]
    );
    return res.json(donations.map(d => ({
      id:            d.id,
      donationRef:   d.donation_ref,
      type:          d.type,
      description:   d.description,
      quantity:      d.quantity,
      pickupAddress: d.pickup_address,
      ngoId:         d.ngo_id,
      ngoName:       d.ngo_name,
      status:        d.status,
      date:          d.date,
      lastUpdated:   d.last_updated
    })));
  } catch (err) {
    console.error('Donations GET error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});


/* ══════════════════════════════════════
   DONATIONS — CREATE
══════════════════════════════════════ */
app.post('/api/donations', authMiddleware, async (req, res) => {
  try {
    const { type, description, quantity, pickupAddress, ngoId, ngoName } = req.body;
    if (!type || !description || !quantity || !pickupAddress)
      return res.status(400).json({ error: 'Type, description, quantity, and pickup address are required.' });

    const donationRef = generateDonationRef();
    const today = todayStr();

    const result = await db.run(
      `INSERT INTO donations
         (user_id, donation_ref, type, description, quantity, pickup_address, ngo_id, ngo_name, status, date, last_updated)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'requested', ?, ?)`,
      [req.userId, donationRef, type, description, quantity, pickupAddress, ngoId || null, ngoName || '', today, today]
    );

    return res.status(201).json({
      message: 'Donation request submitted successfully.',
      donationRef, id: result.lastInsertRowid
    });
  } catch (err) {
    console.error('Donations POST error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});


/* ══════════════════════════════════════
   VOLUNTEER — ACTIVATE
══════════════════════════════════════ */
app.post('/api/volunteer/activate', authMiddleware, async (req, res) => {
  try {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.userId]);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    if (user.is_volunteer) return res.status(409).json({ error: 'Volunteer subprofile already active.' });

    await db.run('UPDATE users SET is_volunteer = 1 WHERE id = ?', [req.userId]);

    const volunteerId   = generateVolunteerId();
    const defaultBadges = JSON.stringify([
      { name: 'First Drive', icon: '🌱', desc: 'Joined iVolunteer active volunteer network' },
      { name: 'Kind Heart',  icon: '❤️', desc: 'Activated volunteer subprofile' }
    ]);
    await db.run(
      `INSERT INTO volunteer_profiles (user_id, volunteer_id, interests, skills, badges, upcoming_drives, joined_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.userId, volunteerId, '["foodDrive","clothingDrive"]', '["Community Support"]', defaultBadges, '[]', todayStr()]
    );

    return res.status(201).json({ message: 'Volunteer subprofile activated.', volunteerId });
  } catch (err) {
    console.error('Volunteer activate error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});


/* ══════════════════════════════════════
   VOLUNTEER — UPDATE PREFERENCES
══════════════════════════════════════ */
app.put('/api/volunteer/profile', authMiddleware, async (req, res) => {
  try {
    const { availability, interests, skills } = req.body;
    const vp = await db.get('SELECT id FROM volunteer_profiles WHERE user_id = ?', [req.userId]);
    if (!vp) return res.status(404).json({ error: 'Volunteer profile not found.' });

    await db.run(
      'UPDATE volunteer_profiles SET availability = ?, interests = ?, skills = ? WHERE user_id = ?',
      [availability || 'weekends', JSON.stringify(interests || []), JSON.stringify(skills || []), req.userId]
    );
    return res.json({ message: 'Volunteer profile updated.' });
  } catch (err) {
    console.error('Volunteer update error:', err);
    return res.status(500).json({ error: 'Server error.' });
  }
});


/* ─── Bootstrap ─── */
db.initDb().then(() => {
  app.listen(PORT, () => {
    console.log(`✅  iVolunteer API running at http://localhost:${PORT} (MySQL/mysql2)`);
  });
}).catch(err => {
  console.error('⚠️  Failed to connect to MySQL database:', err.message);
  console.error('👉  Please check your MySQL credentials in backend/.env (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME)');
});
