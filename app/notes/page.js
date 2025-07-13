'use client';
import Editor from "@/components/Editor";
import MDX from "@/components/MDX";
import SideNav from "@/components/SideNav";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getDoc } from 'firebase/firestore';

export default function NotesPage() {
  
  const [isViewer, setIsViewer] = useState(true);
  // const [text, setText] = useState('');
  const [showNav, setShowNav] = useState(false);
  const [note, setNote] = useState({
    content: '',
  });
  const [isloading, setIsLoading] = useState(false)
  const [noteIds, setNoteIds] = useState([])
  const [savingNote, setSavingNote] = useState(false)

  const {currentUser, isLoadingUser} = useAuth();

  const searchParams = useSearchParams()

  function handleToggleViewer() {
    console.log('toggling viewer/editor' , isViewer);
    setIsViewer(!isViewer);
  }

  function handleToggleMenu() {
    console.log('toggling menu', showNav);
    setShowNav(!showNav);
  }
  function handleCreateNote() {
    // create a new note
    setNote({
      content: '',
    })
    setIsViewer(false)
    window.history.replaceState(null, '', '/notes')
  }

  function handleEditNote(e) {
    // edit an existing note
    setNote({...note,
      content: e.target.value,
    })
  }

  async function handleSaveNote() {
    if (!note?.content) {
      return;
    }
    setSavingNote(true)
    try {
      // see if note already exists in database
      if (note.id) {
        // update existing note
        const notesRef = doc(db, 'users', currentUser.uid, 'notes', note.id);
        await setDoc(notesRef, {
          ...note,
        }, {merge: true})
      } else {
        // create new note
        const newId = note.content.replaceAll('#', '').slice(0, 15) + '__' + Date.now();
        const notesRef = doc(db, 'users', currentUser.uid, 'notes', newId);
        const newDocInfo = await setDoc(notesRef, {
          content: note.content,
          createdAt: serverTimestamp()
        })
        setNoteIds(curr => [...curr, newId])
        setNote({...note, id: newId})
        window.history.pushState(null, '', `?id=${newId}`)
      }
    } catch (error) {
      console.log('ERROR SAVING NOTE: ', error.message)
    } finally {
      setSavingNote(false)
    }
  }

  useEffect(() => {
    // locally cache notes in a global context 
    // like the one we alredy have, just need a extra state
    const value = searchParams.get('id')
    if (!value || !currentUser) {return}
    async function fetchNote() {
      if (isloading) {return}
      try {
        setIsLoading(true)
        const notesRef = doc(db, 'users', currentUser.uid, 'notes', value);
        const snapshot = await getDoc(notesRef)
        const docData = snapshot.exists() ? { id: snapshot.id, ...snapshot.
          data() } : null
          if (docData) {
            setNote({...docData})
          }
      } catch (error) {
        console.log('ERROR FETCHING NOTE: ', error.message)
      } finally {
        setIsLoading(false)
      }
    }
    fetchNote()
  }, [searchParams, currentUser])
  console.log('CURRENT USER: ', currentUser)
  if (isLoadingUser) {
    return (
      <h6 className="text-gradient">Loading...</h6>
    )
  }

  if (!currentUser) {
    // if not user found boot to home page.
    window.location.href = '/'
  }
  return (
    <main id="notes">
      <SideNav setIsViewer={setIsViewer} handleCreateNote={handleCreateNote} noteIds={noteIds} setNoteIds={setNoteIds} showNav={showNav} setShowNav={setShowNav}/>
      {!isViewer && (
        <Editor savingNote={savingNote} handleSaveNote={handleSaveNote} handleToggleMenu={handleToggleMenu} setText={handleEditNote} text={note.content} isViewer={isViewer} handleToggleViewer={handleToggleViewer}/>
      )}
      {isViewer && (
        <MDX savingNote={savingNote} handleSaveNote={handleSaveNote} handleToggleMenu={handleToggleMenu} text={note.content} isViewer={isViewer} handleToggleViewer={handleToggleViewer}/>
      )}
    </main>
  );
}
