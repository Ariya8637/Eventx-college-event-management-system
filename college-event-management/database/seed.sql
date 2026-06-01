INSERT INTO users (email, password_hash, role) VALUES 
('admin@example.com', 'hashed_secret', 'admin'),
('organizer@example.com', 'hashed_secret', 'organizer'),
('student@example.com', 'hashed_secret', 'student');

INSERT INTO events (title, description, date, location, organizer_id) VALUES
('Tech Fest 2023', 'Annual technical festival', '2023-10-10 09:00:00', 'Auditorium', 2);
