import React, { useState, useEffect } from 'react';

import { db, logout } from "./utils/firebase";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';

import { getFunctions, httpsCallable } from "firebase/functions";

import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
} from '@mui/material';
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PendingIcon from "@mui/icons-material/Pending";

import DeleteIcon from '@mui/icons-material/Delete';
import { onSnapshot } from "firebase/firestore"; 

interface Migration {
  id: string;
  title: string;
  status: string; 
  task_index?: string;  // task_index is now optional
}

function MigrationList() {
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [editingMigration, setEditingMigration] = useState<Migration | null>(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'migrations'), (snapshot) => {
      const fetchedMigrations: Migration[] = [];
      snapshot.forEach((doc) => {
        fetchedMigrations.push({ id: doc.id, ...doc.data() } as Migration);
      });
      setMigrations(fetchedMigrations);
    });

    return () => unsubscribe(); 
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(event.target.value);
  };

  const handleInputKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      await addMigration();
    }
  };



  const addMigration = async () => {
    try {
      if (newTitle.trim() !== '') { 
        const docRef = await addDoc(collection(db, 'migrations'), {
          title: newTitle,
          status: 'pending', 
        });
        setMigrations([...migrations, { 
          id: docRef.id, 
          title: newTitle, 
          status: 'pending', 
        }]);
        setNewTitle('');
      }
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  const deleteMigration = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'migrations', id));
      setMigrations(migrations.filter((sol) => sol.id !== id));
    } catch (error) {
      console.error('Error deleting document: ', error);
    }
  };

  const handleTitleClick = (mig: Migration) => {
    setEditingMigration(mig);
  };

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (editingMigration) {
      setEditingMigration({ ...editingMigration, title: event.target.value });
    }
  };

  const handleTitleBlur = async () => {
    if (editingMigration) {
      await updateMigration(editingMigration);
    }
  };

  const handleTitleKeyDown = async (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && editingMigration) {
      await updateMigration(editingMigration);
    }
  };

  const updateMigration = async (migration: Migration) => {
    try {
      await updateDoc(doc(db, 'migrations', migration.id), {
        title: migration.title,
      });
      setMigrations(
        migrations.map((mig) => (mig.id === migration.id ? migration : mig)),
      );
    } catch (error) {
      console.error('Error updating document: ', error);
    } finally {
      setEditingMigration(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  const updateMigrationStatus = async (migrationId: string) => {
    try {
      const migrationToUpdate = migrations.find(mig => mig.id === migrationId);
      if (migrationToUpdate) {
        const newStatus = migrationToUpdate.status === 'completed' ? 'pending' : 'completed';
        await updateDoc(doc(db, 'migrations', migrationId), { status: newStatus }); 
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };
    const runJobManually = async (migrationId: string) => {
      const functions = getFunctions();
      const myFunction = httpsCallable(functions, "runJobManually");

      try {
        const result = await myFunction({ migrationId: migrationId });
        console.log("Result:", result.data);
      } catch (error) {
        console.error("Error calling function:", error);
      }
    };

  return (
    <div>
      <Box display="flex" justifyContent="flex-end"> 
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Box>
      
      <TextField
        label="Enter migration title"
        value={newTitle}
        onChange={handleInputChange}
        onKeyDown={handleInputKeyDown}
        fullWidth
        margin="normal"
      />

      <Button variant="contained" onClick={addMigration}>
        Add Migration
      </Button>

      <List>
        {migrations.map((mig) => (
          <ListItem key={mig.id} disablePadding>
            {editingMigration?.id === mig.id ? (
              <TextField
                value={editingMigration.title}
                onChange={handleTitleChange}
                onBlur={handleTitleBlur}
                onKeyDown={handleTitleKeyDown}
                autoFocus
                fullWidth
              />
            ) : (
              <>
                <ListItemText
                  primary={mig.title}
                  onClick={() => handleTitleClick(mig)}
                />
                {mig.task_index && ( // Conditionally render task_index
                  <ListItemText
                    secondary={`Task Index: ${mig.task_index}`}
                    onClick={() => handleTitleClick(mig)}
                  />
                )}
              </>
            )}
            <Button
              onClick={() => runJobManually(mig.id)}
            >Run Job
            </Button>

            <Button
              onClick={() => updateMigrationStatus(mig.id)}
            >Update Value
            </Button>

            {mig.status && ( // Conditionally render task_index
              <ListItemText
                secondary={`Value: ${mig.status}`}
                
              />
            )}
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => deleteMigration(mig.id)}
            >
              <DeleteIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
    </div>
  );
}

export default MigrationList;