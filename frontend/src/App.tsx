import React, { useState, useEffect } from 'react';
import { db } from './utils/firebase';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import {
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

interface Migration {
  id: string;
  title: string;
}

function MigrationList() {
  const [migrations, setMigrations] = useState<Migration[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [editingMigration, setEditingMigration] = useState<Migration | null>(null);

  useEffect(() => {
    const fetchMigrations = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'migrations'));
        const fetchedMigrations: Migration[] = [];
        querySnapshot.forEach((doc) => {
          fetchedMigrations.push({ id: doc.id, ...doc.data() } as Migration);
        });
        setMigrations(fetchedMigrations);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchMigrations();
  }, []);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitle(event.target.value);
  };

  const handleInputKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === 'Enter') {
      await addMigration();
    }
  };

  const addMigration = async () => {
    try {
      if (newTitle.trim() !== '') {
        const docRef = await addDoc(collection(db, 'migrations'), {
          title: newTitle,
        });
        setMigrations([...migrations, { id: docRef.id, title: newTitle }]);
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

  const handleTitleKeyDown = async (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
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

  return (
    <div>
      {/* Input field with MUI */}
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

      {/* Migration list with MUI */}
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
              <ListItemText
                primary={mig.title}
                onClick={() => handleTitleClick(mig)}
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