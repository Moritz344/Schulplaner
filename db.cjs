const Database = require("better-sqlite3");

const db = new Database("schulplaner.db")

const defaultSubjects = [
  { name: "Mathematik",id: 1,color: "blue"},
  { name: "Deutsch",id: 2, color: "red"},
  { name: "Informatik",id: 3,color: "blue"},
  { name: "Sozialkunde",id: 4,color: "green"},
  { name: "Ethik",id: 5,color: "gray"},
  { name: "Englisch",id: 6,color: "yellow"},
  { name: "Physik",id: 7,color: "green"},
  { name: "Geschichte",id: 8,color: "green"},
  { name: "Erdkunde",id: 9,color: "green"},
  { name: "Biologie",id: 10,color: "green"},
  { name: "Chemie",id: 11,color: "yellow"},
  { name: "Sport",id: 12,color: "gray"},
  { name: "Religion",id: 13,color: "gray"},
  { name: "Kunst",id: 14,color: "yellow"},
  { name: "Musik",id: 15,color: "yellow"},
  { name: "Französisch",id: 16,color: "yellow"},
  { name: "Latein",id: 17,color: "red"},
  { name: "Rechtslehre",id: 18,color: "red"},
  { name: "Betriebswirtschaftslehre",id: 19,color: "red"},
  { name: "Rechnungswesen",id: 20,color: "yellow"},
]

db.exec(`CREATE TABLE IF NOT EXISTS subjects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  color TEXT NOT NULL,
  name TEXT NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS homework (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  due_date INTEGER,
  completed BOOLEAN DEFAULT FALSE,
  fk_subject INTEGER REFERENCES subjects(id) ON DELETE SET NULL,
  name TEXT NOT NULL
)`);

db.exec(`CREATE TABLE IF NOT EXISTS grades (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fk_subject INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    grade REAL NOT NULL
  )`
);


db.exec(`CREATE TABLE IF NOT EXISTS exams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fk_subject INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    description TEXT,
    date INTEGER
  )
`);

db.exec(`CREATE TABLE IF NOT EXISTS timetable (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fk_subject INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    day INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    room TEXT
  )
`);

db.exec(`CREATE TABLE IF NOT EXISTS timetable_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hour_length INTEGER NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    break_time INTEGER NOT NULL,
    break_step INTEGER NOT NULL
  )`
);

function resetTable(name) {
  db.exec("DROP TABLE " + name);
}


function createTestHomeworkData() {
  db.prepare("INSERT INTO homework (name,fk_subject,due_date) VALUES (?,?,?)").run("Nullstellen berechnen", 1, 1791756000000 )
  db.prepare("INSERT INTO homework (name,fk_subject,due_date) VALUES (?,?,?)").run("Nullstellen berechnen", 1,1790114400000)
}

function createTestExamsData() {
  db.prepare("INSERT INTO exams (description,fk_subject,date) VALUES (?,?,?)").run("Mathe Klassenarbeit", 1, 1790114400000)
  db.prepare("INSERT INTO exams (description,fk_subject,date) VALUES (?,?,?)").run("Mathe Klassenarbeit", 1,1791756000000)
}


function initDefaultSubjects() {
  for (const s of defaultSubjects) {
    db.prepare("INSERT INTO subjects (name,color,id) VALUES(?,?,?)")
      .run(s.name,s.color,s.id)
  }
}

function initDefaultData() {
  if (!db.prepare("SELECT 1 FROM subjects WHERE 1=1").get()) {
    initDefaultSubjects();
  }
}

initDefaultData();

function listSubjects() {
  return db.prepare("SELECT * FROM subjects").all();
}

function listHomework() {
  return db.prepare("SELECT * FROM homework ORDER BY CAST(due_date AS INTEGER)").all();
}

function listExam() {
  return db.prepare("SELECT * FROM exams").all();
}

function deleteHomework(id) {
  db.prepare("DELETE FROM homework WHERE id = ?").run(id)
}

function deleteGrade(id) {
  db.prepare("DELETE FROM grades WHERE id = ?").run(id);
}

function resetGrades() {
  db.prepare("DELETE FROM grades").run();
}

function updateGrade(grade) {
  if (grade.id > 0) {
    db.prepare("UPDATE grades SET grade = ?,fk_subject = ? WHERE id = ?").run(grade.grade,grade.fk_subject,grade.id);
  } else {
    db.prepare("INSERT INTO grades (fk_subject,grade) VALUES(?,?)").run(grade.fk_subject,grade.grade)
  }
}

function updateTimetableConfig(config) {
  const existing = db.prepare("SELECT id FROM timetable_config ORDER BY id DESC LIMIT 1").get();
  const targetId = config.id > 0 ? config.id : existing?.id;

  if (targetId) {
    db.prepare("UPDATE timetable_config SET hour_length = ?,start_time = ?,end_time = ?,break_time = ?,break_step = ? WHERE id = ?")
      .run(config.hour_length,config.start_time,config.end_time,config.break_time,config.break_step,targetId)
  } else {
    db.prepare("INSERT INTO timetable_config (hour_length,start_time,end_time,break_time,break_step) VALUES(?,?,?,?,?)")
      .run(config.hour_length,config.start_time,config.end_time,config.break_time,config.break_step)
  }
}


function listTimetableConfig() {
  return db.prepare("SELECT * FROM timetable_config ORDER BY id DESC LIMIT 1").all();
}

function resetTimetable() {
  db.prepare("DELETE FROM timetable").run();
}

function saveTimetable(entries) {
  const insert = db.prepare("INSERT INTO timetable (fk_subject,day,start_time,end_time,room) VALUES(?,?,?,?,?)");
  const replaceAll = db.transaction((rows) => {
    resetTimetable();
    for (const row of rows) {
      insert.run(row.fk_subject,row.day,row.start_time,row.end_time,row.room);
    }
  });
  replaceAll(entries);
}

function listTimetable() {
  return db.prepare("SELECT * FROM timetable ORDER BY day,start_time").all();
}


function listGrades() {
  return db.prepare("SELECT * FROM grades").all()
}

function updateHomework(homework) {
  if (homework.id > 0)  {
    db.prepare("UPDATE homework SET completed = ? WHERE id = ?")
      .run(+homework.completed,homework.id)
  } else {
    db.prepare("INSERT INTO homework (name,due_date,completed,fk_subject) VALUES(?,?,?,?)")
      .run(homework.name,homework.due_date,+homework.completed,homework.fk_subject,)
  }
}

function newExam(exam) {
  db.prepare("INSERT INTO exams (fk_subject,description,date) VALUES(?,?,?)").run(exam.fk_subject,exam.description,exam.date)
}





module.exports = {
  listHomework,
  listExam,
  listGrades,
  listSubjects,
  updateHomework,
  updateGrade,
  deleteHomework,
  deleteGrade,
  newExam,
  resetGrades,
  updateTimetableConfig,
  listTimetableConfig,
  saveTimetable,
  listTimetable,
}
