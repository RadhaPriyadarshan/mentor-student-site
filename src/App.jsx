import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Container, Grid,
  TextField, Button, FormControl, InputLabel, Select,
  MenuItem, Checkbox, ListItemText, TableContainer,
  Paper, Table, TableHead, TableRow, TableCell, TableBody
} from '@mui/material';

const App = () => {
  const [mentorName, setMentorName] = useState('');
  const [studentName, setStudentName] = useState('');
  const [mentors, setMentors] = useState([]);
  const [students, setStudents] = useState([]);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [selectedMentorId, setSelectedMentorId] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedMentorIdForStudent, setSelectedMentorIdForStudent] = useState('');

  useEffect(() => {
    fetchMentors();
    fetchStudents();
  }, []);

  const fetchMentors = async () => {
    try {
      const response = await fetch('https://mentor-student-api-0moh.onrender.com/mentors');
      const data = await response.json();
      setMentors(data);
    } catch (error) {
      console.error('Error fetching mentors:', error);
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await fetch('https://mentor-student-api-0moh.onrender.com/students');
      const data = await response.json();
      setStudents(data);
      setAvailableStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const createMentor = async () => {
    try {
      const response = await fetch('https://mentor-student-api-0moh.onrender.com/mentors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: mentorName })
      });
      const newMentor = await response.json();
      setMentors([...mentors, newMentor]);
      setMentorName('');
    } catch (error) {
      console.error('Error creating mentor:', error);
    }
  };

  const createStudent = async () => {
    try {
      const response = await fetch('https://mentor-student-api-0moh.onrender.com/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: studentName })
      });
      const newStudent = await response.json();
      setStudents([...students, newStudent]);
      setAvailableStudents([...availableStudents, newStudent]);
      setStudentName('');
    } catch (error) {
      console.error('Error creating student:', error);
    }
  };

  const handleMentorChange = (event) => {
    setSelectedMentorId(event.target.value);
  };

  const handleStudentChange = (event) => {
    setSelectedStudentIds(event.target.value);
  };

  const removeAssignedStudents = (availableStudents, assignedStudentIds) => {
    return availableStudents.filter(student => !assignedStudentIds.includes(student.student_id));
  };

  const assignMultipleStudentsToMentor = () => {
    const updatedMentors = mentors.map(mentor => {
      if (mentor.mentor_id === selectedMentorId) {
        mentor.students = [...mentor.students, ...selectedStudentIds];
      }
      return mentor;
    });
    setMentors(updatedMentors);
    setSelectedStudentIds([]);
    const updatedAvailableStudents = availableStudents.filter(student => !selectedStudentIds.includes(student.student_id));
    setAvailableStudents(updatedAvailableStudents);
  };

  const assignOrChangeMentorForStudent = () => {
    const previousMentor = mentors.find(mentor => mentor.students.includes(selectedStudentId));
    if (previousMentor) {
      previousMentor.students = previousMentor.students.filter(studentId => studentId !== selectedStudentId);
    }
    const newMentor = mentors.find(mentor => mentor.mentor_id === selectedMentorIdForStudent);
    if (newMentor) {
      newMentor.students.push(selectedStudentId);
    }
    setMentors([...mentors]);
    setSelectedStudentId('');
    setSelectedMentorIdForStudent('');
  };

  const getMentorStudents = (mentorId) => {
    const mentor = mentors.find((mentor) => mentor.mentor_id === mentorId);
    if (!mentor || !mentor.students) return [];
    return mentor.students.map(studentId => {
      const student = students.find(s => s.student_id === studentId);
      return student ? student.name : '';
    });
  };
  

  
  return (
    <div>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Mentor-Student Management</Typography>
        </Toolbar>
      </AppBar>
      <Container>
        <Grid container spacing={3} style={{ marginTop: 20 }}>
          <Grid item xs={12}>
            <Typography variant="h5">Create Mentor</Typography>
            <TextField
              label="Mentor Name"
              value={mentorName}
              onChange={(e) => setMentorName(e.target.value)}
            />
            <Button onClick={createMentor} variant="contained" color="primary" style={{ marginLeft: 10 }}>Create Mentor</Button>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5">Create Student</Typography>
            <TextField
              label="Student Name"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
            />
            <Button onClick={createStudent} variant="contained" color="primary" style={{ marginLeft: 10 }}>Create Student</Button>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5">Assign Multiple Students to Mentor</Typography>
            <FormControl fullWidth>
              <InputLabel>Mentor</InputLabel>
              <Select
                value={selectedMentorId}
                onChange={handleMentorChange}
              >
                {mentors.map((mentor) => (
                  <MenuItem key={mentor._id} value={mentor.mentor_id}>
                    {mentor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth style={{ marginTop: 10 }}>
              <InputLabel>Students</InputLabel>
              <Select
                multiple
                value={selectedStudentIds}
                onChange={handleStudentChange}
                renderValue={(selected) => selected.map(studentId => {
                  const student = students.find(s => s.student_id === studentId);
                  return student ? student.name : '';
                }).join(', ')}
              >
                {removeAssignedStudents(availableStudents, selectedStudentIds).map((student) => (
                  <MenuItem key={student._id} value={student.student_id}>
                    <Checkbox checked={selectedStudentIds.includes(student.student_id)} />
                    <ListItemText primary={student.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button onClick={assignMultipleStudentsToMentor} variant="contained" color="primary" style={{ marginTop: 10 }}>Assign Students</Button>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5">Assign or Change Mentor for Student</Typography>
            <FormControl fullWidth>
              <InputLabel>Student</InputLabel>
              <Select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
              >
                {students.map((student) => (
                  <MenuItem key={student._id} value={student.student_id}>
                    {student.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth style={{ marginTop: 10 }}>
              <InputLabel>Mentor</InputLabel>
              <Select
                value={selectedMentorIdForStudent}
                onChange={(e) => setSelectedMentorIdForStudent(e.target.value)}
              >
                {mentors.map((mentor) => (
                  <MenuItem key={mentor._id} value={mentor.mentor_id}>
                    {mentor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button onClick={assignOrChangeMentorForStudent} variant="contained" color="primary" style={{ marginTop: 10 }}>Assign Mentor</Button>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h5">Mentors and Their Students</Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Mentor</TableCell>
                    <TableCell>Students</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {mentors.map((mentor) => (
                    <TableRow key={mentor._id}>
                      <TableCell>{mentor.name}</TableCell>
                      <TableCell>{getMentorStudents(mentor.mentor_id).join(' ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};

export default App;
