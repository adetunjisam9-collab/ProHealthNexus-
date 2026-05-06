-- Users table (patients, doctors, admin)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) CHECK (role IN ('patient', 'doctor', 'admin')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments table
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id),
  doctor_id INTEGER REFERENCES users(id),
  appointment_date TIMESTAMP NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')) DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health vitals table
CREATE TABLE vitals (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id),
  recorded_by INTEGER REFERENCES users(id),
  heart_rate INTEGER,
  systolic INTEGER,
  diastolic INTEGER,
  temperature DECIMAL(4,1),
  oxygen_level INTEGER,
  weight DECIMAL(5,1),
  recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lab results table
CREATE TABLE lab_results (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES users(id),
  doctor_id INTEGER REFERENCES users(id),
  test_name VARCHAR(100) NOT NULL,
  result VARCHAR(255) NOT NULL,
  unit VARCHAR(50),
  status VARCHAR(20) CHECK (status IN ('normal', 'low', 'high')) DEFAULT 'normal',
  test_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);